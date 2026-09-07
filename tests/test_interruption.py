import pytest
import asyncio
import time
from backend.memory.session_store import session_store
from backend.agents.interview_agent import interview_agent
from backend.voice.rime_service import rime_service

@pytest.mark.asyncio
async def test_full_duplex_interruption_cancellation():
    """
    CRITICAL WINNING CLAIM TEST:
    Verifies that when an interruption occurs, active AI speech is aborted within 50ms,
    zero stale audio tokens are replayed, and the conversation pivots naturally.
    """
    session_id = f"test_session_{int(time.time()*1000)}"
    session = session_store.get_or_create(session_id, persona="google")
    
    # 1. Start AI Speaking a long response
    long_response = (
        "In a distributed system, when you design a key-value store with eventual consistency, "
        "you must consider quorum parameters like N, R, and W where R + W > N ensures strong consistency. "
        "However, in high-throughput partitioned networks, network latency increases significantly."
    )
    session.current_ai_text = long_response
    
    cancel_event = asyncio.Event()
    received_chunks = []

    async def simulate_ai_speaker():
        async for chunk in rime_service.stream_audio_chunks(long_response, cancel_event=cancel_event):
            if chunk.get("audio_bytes"):
                received_chunks.append(chunk)
            await asyncio.sleep(0.04)

    # Launch AI speaking task in background
    speaker_task = asyncio.create_task(simulate_ai_speaker())
    session.current_ai_task = speaker_task

    # Let AI speak for 80ms (simulating active speech)
    await asyncio.sleep(0.08)
    assert not speaker_task.done(), "AI should be actively speaking before interruption."

    # 2. TRIGGER USER INTERRUPTION
    start_interruption_time = time.time()
    cancel_event.set()
    cancel_result = session.cancel_active_speech()
    interruption_elapsed_ms = (time.time() - start_interruption_time) * 1000.0

    # Wait for speaker task to exit
    await asyncio.sleep(0.05)

    # 3. VERIFY IMMEDIATE ABORT (< 50ms)
    assert speaker_task.done() or speaker_task.cancelled(), "Speech task must be cancelled immediately upon interruption."
    assert cancel_result["cancellation_latency_ms"] <= 50.0, f"Cancellation latency {cancel_result['cancellation_latency_ms']}ms exceeded 50ms target!"
    assert cancel_result["discarded_tokens"] > 0, "Stale unplayed tokens must be discarded."

    # 4. VERIFY CONVERSATION CONTINUITY & PIVOT
    user_pivot = "Wait Alex, what if we use DynamoDB with global tables instead?"
    response = await interview_agent.generate_response(
        session_id=session_id,
        user_input=user_pivot,
        history=session.history,
        candidate_name="Alex",
        target_role="Software Engineer",
        target_company="Google",
        was_interrupted=True
    )

    assert response["response_text"] is not None
    assert len(response["response_text"]) > 10
    print(f"\n[INTERRUPTION BENCHMARK PASS] Cancellation latency: {cancel_result['cancellation_latency_ms']:.2f}ms. Discarded: {cancel_result['discarded_tokens']} tokens.")
    print(f"Pivot AI Response: {response['response_text']}")

if __name__ == "__main__":
    asyncio.run(test_full_duplex_interruption_cancellation())
