import pytest
import asyncio
from backend.memory.session_store import session_store, normalize_text_tokens
from backend.agents.interview_agent import interview_agent
from backend.agents.personas import (
    STAGE_QUESTION_BANKS,
    COMPANY_BEHAVIORAL_QUESTIONS,
    get_stage_fallback_question,
    generate_initial_greeting
)

@pytest.mark.asyncio
async def test_8_turn_natural_stage_progression_no_duplicates():
    """
    Verifies that across 8 continuous turns:
    1. The interview progresses naturally: Introduction -> Technical -> Behavioral -> Closing
    2. Zero duplicate questions are generated (asked_questions grows uniquely)
    3. The AI builds on previous answers without restarting the session.
    """
    session_id = "test_progression_session_1"
    session = session_store.get_or_create(
        session_id=session_id,
        persona="google",
        target_role="AI Engineer",
        target_company="Google",
        interview_type="Technical",
        difficulty="hard",
        experience_level="Senior"
    )

    # 1. Initial Greeting
    greeting = generate_initial_greeting(
        candidate_name="Alex",
        target_role="AI Engineer",
        target_company="Google",
        interview_type="Technical",
        difficulty="hard"
    )
    session.add_message("assistant", greeting)
    session.add_asked_question(greeting)
    assert session.current_stage == "introduction"
    assert len(session.asked_questions) >= 1

    # Simulated candidate responses over 8 turns
    candidate_responses = [
        "I built a high-throughput RAG pipeline with hybrid BM25 and vector search using Qdrant.",
        "We achieved sub-80ms p95 latency by using vLLM continuous batching and flash attention on A100s.",
        "To reduce hallucinations, we added an automated cross-encoder re-ranking step and confidence thresholding.",
        "We used 4-bit AWQ quantization which reduced memory footprint by 55% with negligible accuracy drop.",
        "When accuracy dropped on edge queries, I took ownership and built an automated regression test suite.",
        "I had to align the product team by showing data on latency tradeoffs rather than just theoretical concerns.",
        "I made sure our pipeline met strict safety guidelines by implementing automated toxic prompt filters.",
        "Thank you! What is Google's biggest AI infrastructure challenge for the next year?"
    ]

    stages_encountered = []

    for i, user_text in enumerate(candidate_responses):
        session.add_message("user", user_text)
        current_stage = session.current_stage
        stages_encountered.append(current_stage)

        res = await interview_agent.generate_response(
            session_id=session_id,
            user_input=user_text,
            history=session.history,
            candidate_name="Alex",
            target_role="AI Engineer",
            target_company="Google",
            interview_type="Technical",
            difficulty="hard",
            experience_level="Senior",
            asked_questions=session.asked_questions,
            current_stage=current_stage,
            turn_count=session.turn_count
        )

        ai_response = res["response_text"]
        assert ai_response is not None and len(ai_response) > 10

        # Verify no restart greeting mid-session
        assert not ai_response.lower().startswith("welcome to your")
        assert not ai_response.lower().startswith("hi alex! welcome")

        # Verify duplicate detection and record question
        assert not session.is_duplicate_question(ai_response, threshold=0.75)
        session.add_asked_question(ai_response)
        session.add_message("assistant", ai_response)

    # Verify that all 4 stages were encountered across the turns
    assert "introduction" in stages_encountered
    assert "technical" in stages_encountered
    assert "behavioral" in stages_encountered
    assert "closing" in stages_encountered

    # Verify that asked_questions contains distinct entries
    assert len(session.asked_questions) >= 5
    print(f"\n[PASS] 8-turn progression completed through stages: {set(stages_encountered)}")
    print(f"Total distinct questions tracked: {len(session.asked_questions)}")

@pytest.mark.asyncio
async def test_duplicate_question_interception_and_fallback():
    """
    Verifies that if an identical or repetitive question is passed to the duplicate detector,
    it correctly flags it as a duplicate and get_stage_fallback_question provides a fresh question.
    """
    session_id = "test_dedup_session_2"
    session = session_store.get_or_create(
        session_id=session_id,
        persona="amazon",
        target_role="Software Engineer",
        target_company="Amazon",
        interview_type="Technical",
        difficulty="medium"
    )

    q1 = "How do you prevent cache stampedes and handle distributed cache invalidation when write volume is high?"
    session.add_asked_question(q1)

    # Test exact duplicate
    assert session.is_duplicate_question(q1) is True

    # Test near duplicate with slight phrasing change
    q1_rephrased = "Can you explain how you prevent cache stampedes and manage distributed cache invalidation?"
    assert session.is_duplicate_question(q1_rephrased, threshold=0.45) is True

    # Test genuinely distinct question
    q2 = "Tell me about a time you showed customer obsession by disagreeing with a team decision."
    assert session.is_duplicate_question(q2) is False

    # Test stage fallback question selection
    fallback_q = get_stage_fallback_question(
        target_role="Software Engineer",
        target_company="Amazon",
        stage="technical",
        difficulty="medium",
        asked_questions=session.asked_questions
    )
    assert fallback_q != q1
    assert len(fallback_q) > 15
    print(f"\n[PASS] Duplicate question successfully detected and replaced with fallback: '{fallback_q}'")

@pytest.mark.asyncio
async def test_role_and_company_specific_customization():
    """
    Verifies that different roles (Frontend, Backend, PM, AI) and companies (Amazon, Google, OpenAI)
    receive stage questions strictly tailored to their domain.
    """
    # 1. Frontend Engineer at Meta
    fe_q = get_stage_fallback_question(
        target_role="Frontend Engineer",
        target_company="Meta",
        stage="technical",
        difficulty="medium",
        asked_questions=[]
    )
    assert any(k in fe_q.lower() for k in ["ui", "webaudio", "react", "render", "state", "fps", "optimistic", "next"])

    # 2. Product Manager at Amazon
    pm_q = get_stage_fallback_question(
        target_role="Product Manager",
        target_company="Amazon",
        stage="behavioral",
        difficulty="medium",
        asked_questions=[]
    )
    assert any(k in pm_q.lower() for k in ["customer", "ownership", "deadline", "simplify", "time", "decision"])

    # 3. Machine Learning Engineer at OpenAI
    ml_q = get_stage_fallback_question(
        target_role="Machine Learning Engineer",
        target_company="OpenAI",
        stage="technical",
        difficulty="hard",
        asked_questions=[]
    )
    assert any(k in ml_q.lower() for k in ["gpu", "parallelism", "bandit", "drift", "inference", "training", "model", "distributed"])
    print(f"\n[PASS] Role & Company customization verified for Frontend, PM, and ML.")
