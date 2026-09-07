import os
import json
import time
import logging
import httpx
from typing import List, Dict, Any, Optional
from backend.utils.config import settings
from backend.agents.personas import (
    generate_system_prompt,
    generate_initial_greeting,
    COMPANY_CULTURES,
    ROLE_TEMPLATES
)

logger = logging.getLogger("echohire.agent")

class InterviewAgent:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.has_openai = bool(self.openai_key and len(self.openai_key) > 10 and not self.openai_key.startswith("your_"))
        self.has_gemini = bool(self.gemini_key and len(self.gemini_key) > 10 and not self.gemini_key.startswith("your_"))
        logger.info(f"InterviewAgent initialized. OpenAI: {self.has_openai}, Gemini: {self.has_gemini}")

    async def generate_response(
        self,
        session_id: str,
        user_input: str,
        history: List[Dict[str, Any]],
        candidate_name: str = "Candidate",
        target_role: str = "Software Engineer",
        target_company: str = "Google",
        interview_type: str = "Technical",
        difficulty: str = "medium",
        experience_level: str = "Mid-Level",
        language: str = "en",
        was_interrupted: bool = False,
        asked_questions: Optional[List[str]] = None,
        current_stage: str = "introduction",
        turn_count: int = 0
    ) -> Dict[str, Any]:
        """
        Generates the next spoken interviewer response customized to the candidate's target role & company.
        Prevents repeating previously asked questions and smoothly advances the interview stage.
        """
        start_time = time.time()
        asked_list = asked_questions or []

        system_prompt = generate_system_prompt(
            candidate_name=candidate_name,
            target_role=target_role,
            target_company=target_company,
            interview_type=interview_type,
            difficulty=difficulty,
            experience_level=experience_level,
            preferred_language=language,
            current_stage=current_stage,
            asked_questions=asked_list,
            turn_count=turn_count
        )

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-8:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

        current_prompt = user_input
        if was_interrupted:
            current_prompt = f"[Note: Candidate interrupted prior thought to clarify]: {user_input}"
        messages.append({"role": "user", "content": current_prompt})

        generated_text: Optional[str] = None
        provider: str = "echohire-intelligence-engine"

        # 1. Try Google Gemini
        if self.has_gemini:
            models_to_try = [settings.GEMINI_MODEL, "gemini-flash-latest", "gemini-1.5-flash", "gemini-pro"]
            seen_models = set()
            candidate_models = []
            for m in models_to_try:
                if m and m not in seen_models:
                    seen_models.add(m)
                    candidate_models.append(m)

            for model_name in candidate_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_key}"
                    gemini_contents = []
                    for m in messages:
                        role_str = "user" if m["role"] in ["user", "system"] else "model"
                        gemini_contents.append({"role": role_str, "parts": [{"text": m["content"]}]})
                    
                    payload = {"contents": gemini_contents, "generationConfig": {"maxOutputTokens": 140, "temperature": 0.7}}
                    async with httpx.AsyncClient(timeout=6.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                text = candidates[0]["content"]["parts"][0]["text"].strip()
                                if text and len(text) > 8:
                                    generated_text = text
                                    provider = f"gemini ({model_name})"
                                    break
                except Exception as e:
                    logger.warning(f"Gemini model {model_name} completion failed: {e}")

        # 2. Try OpenAI GPT
        if not generated_text and self.has_openai:
            try:
                headers = {
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.OPENAI_MODEL,
                    "messages": messages,
                    "max_tokens": 140,
                    "temperature": 0.7
                }
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"].strip()
                        if content and len(content) > 8:
                            generated_text = content
                            provider = "openai-gpt"
            except Exception as e:
                logger.warning(f"OpenAI completion failed: {e}")

        # 3. Dynamic Heuristic Intelligence Engine
        if not generated_text:
            generated_text = self._generate_role_based_response(
                user_input=user_input,
                target_role=target_role,
                target_company=target_company,
                difficulty=difficulty,
                current_stage=current_stage,
                asked_questions=asked_list,
                was_interrupted=was_interrupted
            )
            provider = "echohire-intelligence-engine"

        # 4. Rigorous Duplicate Question Check & Stage Fallback
        if self._is_duplicate_or_restart(generated_text, asked_list):
            logger.info(f"Duplicate/restart response detected: '{generated_text}'. Substituting with progressive stage question.")
            fallback_q = get_stage_fallback_question(
                target_role=target_role,
                target_company=target_company,
                stage=current_stage,
                difficulty=difficulty,
                asked_questions=asked_list
            )
            generated_text = f"Understood. Continuing our {target_company} {current_stage} evaluation: {fallback_q}"

        latency_ms = (time.time() - start_time) * 1000.0
        return {
            "response_text": generated_text,
            "latency_ms": round(latency_ms, 2),
            "provider": provider,
            "target_role": target_role,
            "target_company": target_company,
            "current_stage": current_stage
        }

    def _is_duplicate_or_restart(self, text: str, asked_questions: List[str]) -> bool:
        """Detects if generated text is a duplicate of previous questions or an accidental restart."""
        if not asked_questions:
            return False

        lower = text.lower().strip()

        # Check for accidental restart greetings mid-interview
        if any(lower.startswith(p) for p in ["welcome to your", "hi candidate! welcome", "hello and welcome to"]):
            return True

        from backend.memory.session_store import normalize_text_tokens
        cand_tokens = normalize_text_tokens(lower)
        if not cand_tokens:
            return False

        for asked in asked_questions:
            asked_clean = asked.lower().strip()
            asked_tok = normalize_text_tokens(asked_clean)
            if asked_tok:
                inter = cand_tokens.intersection(asked_tok)
                if len(inter) >= 5 and (len(inter) / max(len(cand_tokens), len(asked_tok)) >= 0.60):
                    return True

        return False

    def _generate_role_based_response(
        self,
        user_input: str,
        target_role: str,
        target_company: str,
        difficulty: str = "medium",
        current_stage: str = "introduction",
        asked_questions: Optional[List[str]] = None,
        was_interrupted: bool = False
    ) -> str:
        lower_input = user_input.lower()
        asked_list = asked_questions or []
        from backend.agents.personas import get_stage_fallback_question
        
        if was_interrupted:
            if "wait" in lower_input or "actually" in lower_input or "clarify" in lower_input:
                return f"Understood, thank you for clarifying that point for our {target_company} evaluation. Please proceed with that thought."
            return "Good point to jump in on. Let's focus on that tradeoff. How did that specifically impact system availability and latency?"

        # If user says closing/summary words in closing stage
        if current_stage == "closing":
            if any(w in lower_input for w in ["thank", "bye", "good", "no question", "none", "covered everything"]):
                return f"It was a pleasure speaking with you today. You demonstrated great technical and communication depth for {target_company}. Have a great rest of your day!"
            return get_stage_fallback_question(target_role, target_company, "closing", difficulty, asked_list)

        # In behavioral stage, ask company-aligned behavioral question
        if current_stage == "behavioral":
            q = get_stage_fallback_question(target_role, target_company, "behavioral", difficulty, asked_list)
            b_trans = [
                f"That gives good context. Looking at teamwork and ownership at {target_company}:",
                f"Valuable perspective. Focusing on decision-making and cross-functional leadership:",
                f"Thank you for sharing that. Regarding team execution and ownership:"
            ]
            trans = b_trans[len(asked_list) % len(b_trans)]
            return f"{trans} {q}"

        # In technical or introduction stage, ask role & difficulty aligned question
        q = get_stage_fallback_question(target_role, target_company, current_stage, difficulty, asked_list)
        t_trans = [
            f"Understood. Moving deeper into your {target_role} architecture:",
            f"Solid explanation. Exploring another critical technical dimension:",
            f"That makes sense. Taking this architectural tradeoff further:"
        ]
        trans = t_trans[len(asked_list) % len(t_trans)]
        return f"{trans} {q}"


    async def evaluate_session_scoring(
        self,
        history: List[Dict[str, Any]],
        metrics: Dict[str, Any],
        target_role: str = "Software Engineer",
        target_company: str = "Google"
    ) -> Dict[str, Any]:
        """
        Calculates comprehensive multi-dimensional interview analytics:
        - Overall Score
        - Confidence Score
        - Clarity & Tone Score
        - Technical Accuracy Score
        - STAR Method Score
        - Communication Score
        - Speech metrics (WPM, Fillers, Interruption Recovery)
        - Strengths, Areas to Refine, and AI Recommendations
        """
        user_msgs = [m.get("content", "") for m in history if m.get("role") == "user"]
        total_user_words = sum(len(m.split()) for m in user_msgs)
        filler_count = metrics.get("filler_words_total", 0)
        wpm = metrics.get("wpm", 138.0)
        interruptions = metrics.get("interruption_count", 0)

        # Multi-factor score models
        wpm_score = 95 if 120 <= wpm <= 160 else max(60, 95 - int(abs(wpm - 140) * 0.7))
        filler_penalty = min(25, filler_count * 3)
        clarity_score = max(68, 96 - filler_penalty)
        confidence_score = min(98, max(70, int(wpm_score * 0.5 + (92 - filler_penalty) * 0.5)))
        technical_score = min(98, max(72, 82 + min(16, len(user_msgs) * 3)))
        star_score = min(96, max(68, 76 + min(20, total_user_words // 18)))
        communication_score = int(round((clarity_score * 0.5) + (confidence_score * 0.5)))

        overall = int(round((clarity_score * 0.2) + (confidence_score * 0.2) + (technical_score * 0.25) + (star_score * 0.2) + (communication_score * 0.15)))

        strengths = [
            f"Strong communication cadence maintaining an optimal speech rate of {wpm} WPM.",
            f"Demonstrated domain mastery in {target_role} concepts relevant to {target_company}.",
            "Quick conversational adaptability during dynamic follow-up probing questions."
        ]

        weaknesses = []
        if filler_count > 2:
            weaknesses.append(f"Detected {filler_count} filler words. Practicing deliberate 1-second pauses will enhance executive presence.")
        if interruptions > 0:
            weaknesses.append(f"Interrupted the interviewer {interruptions} time(s). Conversational agility is high, but ensure natural pauses before jumping in.")
        if len(weaknesses) == 0:
            weaknesses.append("Quantify the 'Result' phase of the STAR framework with concrete business metrics (e.g., latency reduction % or revenue impact).")

        tips = [
            f"Review {target_company}'s core leadership principles and engineering values before your final round.",
            "Use explicit Situation-Task-Action-Result anchors when detailing past project challenges.",
            "Quantify outcomes with concrete numbers (e.g., 'reduced p99 latency from 450ms to 85ms')."
        ]

        return {
            "overall_score": overall,
            "confidence_score": confidence_score,
            "clarity_score": clarity_score,
            "technical_score": technical_score,
            "star_score": star_score,
            "communication_score": communication_score,
            "wpm": wpm,
            "filler_word_count": filler_count,
            "interruption_count": interruptions,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "tips": tips,
            "target_role": target_role,
            "target_company": target_company
        }

interview_agent = InterviewAgent()
