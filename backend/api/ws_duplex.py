import asyncio
import base64
import json
import logging
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.memory.session_store import session_store
from backend.agents.interview_agent import interview_agent
from backend.agents.personas import generate_initial_greeting, COMPANY_CULTURES
from backend.voice.rime_service import rime_service
from backend.voice.deepgram_service import deepgram_service

logger = logging.getLogger("echohire.ws_duplex")
router = APIRouter()

@router.websocket("/ws/duplex")
async def websocket_duplex_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = websocket.query_params.get("session_id", f"sess_{int(time.time()*1000)}")
    candidate_name = websocket.query_params.get("candidate_name", "Candidate")
    target_role = websocket.query_params.get("target_role", "Software Engineer")
    target_company = websocket.query_params.get("target_company", "Google")
    interview_type = websocket.query_params.get("interview_type", "Technical")
    difficulty = websocket.query_params.get("difficulty", "medium")
    experience_level = websocket.query_params.get("experience_level", "Mid-Level")
    language = websocket.query_params.get("language", "en")

    session = session_store.get_or_create(
        session_id=session_id,
        persona=target_company.lower(),
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty,
        experience_level=experience_level,
        language=language
    )
    logger.info(f"WebSocket client connected. Session: {session_id}, Role: {target_role}, Company: {target_company}, Stage: {session.current_stage}")

    cancel_event = asyncio.Event()
    active_tts_task = None

    async def send_json_safe(data: dict):
        try:
            await websocket.send_text(json.dumps(data))
        except Exception:
            pass

    async def synthesize_and_stream_response(text: str, comp_persona: str, was_interrupted: bool):
        nonlocal cancel_event
        cancel_event.clear()
        speaker = COMPANY_CULTURES.get(comp_persona.lower(), COMPANY_CULTURES["default"])["voice"]
        start_tts = time.time()

        try:
            async for chunk_info in rime_service.stream_audio_chunks(
                text=text,
                speaker=speaker,
                cancel_event=cancel_event
            ):
                if cancel_event.is_set():
                    logger.info("Streaming aborted due to cancel_event.")
                    break

                raw_bytes = chunk_info.get("audio_bytes", b"")
                b64_audio = base64.b64encode(raw_bytes).decode("utf-8") if raw_bytes else ""
                
                await send_json_safe({
                    "type": "ai_audio_chunk",
                    "chunk_index": chunk_info.get("chunk_index", 0),
                    "audio_base64": b64_audio,
                    "ttfb_ms": chunk_info.get("ttfb_ms", 0.0),
                    "is_final": chunk_info.get("is_final", False),
                    "engine": chunk_info.get("engine", "rime"),
                    "text_snippet": text
                })

            if not cancel_event.is_set():
                session.add_message("assistant", text, interrupted=False)
                await send_json_safe({
                    "type": "ai_speech_complete",
                    "total_tts_duration_ms": round((time.time() - start_tts) * 1000.0, 2)
                })

        except asyncio.CancelledError:
            logger.info("TTS Task cancelled via asyncio.CancelledError.")
        except Exception as e:
            logger.error(f"Error in TTS streaming: {e}")

    # Generate initial dynamic greeting tailored to target role and company
    greeting = generate_initial_greeting(
        candidate_name=candidate_name,
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty
    )
    session.add_message("assistant", greeting, interrupted=False)
    session.add_asked_question(greeting)

    # Send session init with current stage
    await send_json_safe({
        "type": "session_init",
        "session_id": session_id,
        "candidate_name": candidate_name,
        "target_role": target_role,
        "target_company": target_company,
        "interview_type": interview_type,
        "greeting_text": greeting,
        "difficulty": difficulty,
        "language": language,
        "stage": session.current_stage,
        "turn_count": session.turn_count,
        "asked_questions_count": len(session.asked_questions)
    })

    # Kick off greeting audio
    active_tts_task = asyncio.create_task(synthesize_and_stream_response(greeting, target_company, False))
    session.current_ai_task = active_tts_task
    session.current_ai_text = greeting

    try:
        while True:
            raw_msg = await websocket.receive_text()
            data = json.loads(raw_msg)
            msg_type = data.get("type", "")

            # ----------------------------------------------------
            # 1. FULL DUPLEX INTERRUPTION
            # ----------------------------------------------------
            if msg_type in ["interrupt", "user_speech_start"]:
                cancel_start = time.time()
                cancel_event.set()

                if active_tts_task and not active_tts_task.done():
                    active_tts_task.cancel()

                cancel_res = session.cancel_active_speech()
                cancel_duration_ms = (time.time() - cancel_start) * 1000.0

                logger.info(f"⚡ Full Duplex Interruption: Aborted in {cancel_duration_ms:.2f}ms.")

                await send_json_safe({
                    "type": "interruption_ack",
                    "cancelled": True,
                    "cancellation_latency_ms": cancel_res["cancellation_latency_ms"],
                    "stale_tokens_discarded": cancel_res["discarded_tokens"],
                    "timestamp": time.time()
                })

            # ----------------------------------------------------
            # 2. USER TRANSCRIPT & CONVERSATION TURN
            # ----------------------------------------------------
            elif msg_type == "user_transcript":
                user_text = data.get("text", "").strip()
                is_final = data.get("is_final", True)
                duration_sec = float(data.get("duration_sec", 0.0))
                was_int = session.is_interrupted

                if not user_text:
                    continue

                speech_metrics = session.metrics.analyze_user_speech(user_text, duration_sec)
                session.add_message("user", user_text, interrupted=was_int)

                # Send metrics update
                await send_json_safe({
                    "type": "metrics_update",
                    "wpm": speech_metrics["wpm"],
                    "total_words": speech_metrics["total_words"],
                    "total_filler_words": speech_metrics["total_filler_words"],
                    "interruption_count": session.metrics.interruption_count,
                    "stage": session.current_stage,
                    "turn_count": session.turn_count
                })

                # Generate non-repetitive dynamic response advancing through interview stages
                llm_res = await interview_agent.generate_response(
                    session_id=session_id,
                    user_input=user_text,
                    history=session.history,
                    candidate_name=candidate_name,
                    target_role=target_role,
                    target_company=target_company,
                    interview_type=interview_type,
                    difficulty=difficulty,
                    experience_level=experience_level,
                    language=language,
                    was_interrupted=was_int,
                    asked_questions=session.asked_questions,
                    current_stage=session.current_stage,
                    turn_count=session.turn_count
                )

                ai_response_text = llm_res["response_text"]
                session.add_asked_question(ai_response_text)
                session.is_interrupted = False
                session.metrics.record_latency(llm_res["latency_ms"])

                # Send AI message with stage information
                await send_json_safe({
                    "type": "ai_message",
                    "text": ai_response_text,
                    "latency_ms": llm_res["latency_ms"],
                    "provider": llm_res["provider"],
                    "was_pivot": was_int,
                    "target_company": target_company,
                    "stage": session.current_stage,
                    "turn_count": session.turn_count,
                    "asked_questions_count": len(session.asked_questions)
                })

                # Stream audio chunks via Rime TTS
                session.current_ai_text = ai_response_text
                active_tts_task = asyncio.create_task(
                    synthesize_and_stream_response(ai_response_text, target_company, was_int)
                )
                session.current_ai_task = active_tts_task


            # ----------------------------------------------------
            # 3. END SESSION & SCORING
            # ----------------------------------------------------
            elif msg_type == "end_session":
                scoring = await interview_agent.evaluate_session_scoring(
                    history=session.history,
                    metrics=session.metrics.get_summary(),
                    target_role=target_role,
                    target_company=target_company
                )
                await send_json_safe({
                    "type": "session_summary",
                    "scoring": scoring,
                    "summary_metrics": session.metrics.get_summary()
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if active_tts_task and not active_tts_task.done():
            active_tts_task.cancel()
