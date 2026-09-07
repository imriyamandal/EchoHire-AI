import pytest
import asyncio
from backend.agents.interview_agent import interview_agent
from backend.agents.personas import generate_system_prompt, generate_initial_greeting

@pytest.mark.asyncio
async def test_dynamic_prompt_generation():
    """Verifies dynamic system prompt and greeting generation for different roles and companies."""
    prompt = generate_system_prompt(
        candidate_name="Alex",
        target_role="AI Engineer",
        target_company="OpenAI",
        interview_type="Technical",
        difficulty="hard",
        experience_level="Senior",
        preferred_language="en"
    )
    assert "OpenAI" in prompt
    assert "AI Engineer" in prompt
    assert "HARD" in prompt

    greeting = generate_initial_greeting(
        candidate_name="Alex",
        target_role="Machine Learning Engineer",
        target_company="Google",
        interview_type="System Design"
    )
    assert "Alex" in greeting
    assert "Google" in greeting

@pytest.mark.asyncio
async def test_star_scoring_evaluation():
    """Verifies STAR and communication evaluation scoring calculation."""
    dummy_history = [
        {"role": "assistant", "content": "Tell me about a high-throughput system you optimized."},
        {"role": "user", "content": "In my previous role at a fintech company, our transaction throughput bottlenecked at 2,000 TPS. I re-architected the pipeline using Apache Kafka and Redis cluster caching, reducing p99 latency by 65% and scaling throughput to 25,000 TPS."},
    ]
    dummy_metrics = {
        "filler_words_total": 1,
        "wpm": 142.0,
        "interruption_count": 0
    }

    score_res = await interview_agent.evaluate_session_scoring(
        history=dummy_history,
        metrics=dummy_metrics,
        target_role="Backend Engineer",
        target_company="Google"
    )

    assert "overall_score" in score_res
    assert score_res["overall_score"] >= 75
    assert "confidence_score" in score_res
    assert "communication_score" in score_res
    assert len(score_res["strengths"]) > 0
    assert len(score_res["tips"]) > 0
