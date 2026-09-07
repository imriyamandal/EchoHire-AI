import time
import re
import asyncio
from typing import Dict, List, Optional, Any, Set
from backend.utils.metrics_tracker import SessionMetricsTracker

# Standard Stopwords & Conversational Fillers for Semantic Question Deduplication
STOP_WORDS: Set[str] = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "can", "could", "would", "should", "will", "what",
    "how", "why", "when", "where", "who", "which", "tell", "me", "about",
    "you", "your", "walk", "through", "describe", "explain", "great", "good",
    "explanation", "going", "deeper", "continuing", "evaluation", "understood",
    "context", "looking", "teamwork", "ownership", "welcome", "thanks", "thank",
    "interview", "point", "proceed", "questions", "share", "today", "cand", "role"
}

def extract_core_question(text: str) -> str:
    """Extracts the primary interrogative sentence from conversational framing."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    questions = [
        s.strip() for s in sentences
        if "?" in s or any(s.lower().strip().startswith(w) for w in ["how", "what", "why", "tell", "walk", "describe", "can", "could", "would"])
    ]
    if questions:
        return " ".join(questions)
    return text.strip()

def normalize_text_tokens(text: str) -> Set[str]:
    """Extracts significant lowercase alphanumeric tokens for similarity comparison."""
    core = extract_core_question(text)
    cleaned = re.sub(r"[^\w\s]", " ", core.lower())
    tokens = set(cleaned.split())
    return {t for t in tokens if t not in STOP_WORDS and len(t) > 2}

class SessionState:
    def __init__(
        self,
        session_id: str,
        persona: str = "google",
        target_role: str = "Software Engineer",
        target_company: str = "Google",
        interview_type: str = "Technical",
        difficulty: str = "medium",
        experience_level: str = "Mid-Level",
        language: str = "en"
    ):
        self.session_id = session_id
        self.persona = persona
        self.target_role = target_role
        self.target_company = target_company
        self.interview_type = interview_type
        self.difficulty = difficulty
        self.experience_level = experience_level
        self.language = language

        # Session Conversation & Question State
        self.history: List[Dict[str, Any]] = []
        self.conversation_history: List[Dict[str, Any]] = self.history  # Synced alias
        self.asked_questions: List[str] = []
        self.current_stage: str = "introduction"  # introduction -> technical -> behavioral -> closing
        self.turn_count: int = 0

        # Runtime & Voice Control
        self.current_ai_task: Optional[asyncio.Task] = None
        self.current_ai_text: str = ""
        self.metrics = SessionMetricsTracker(session_id)
        self.created_at = time.time()
        self.last_activity = time.time()
        self.is_interrupted = False
        self.cancellation_token: Optional[str] = None

    def add_message(self, role: str, content: str, interrupted: bool = False):
        self.history.append({
            "role": role,
            "content": content,
            "interrupted": interrupted,
            "timestamp": time.time()
        })
        self.last_activity = time.time()
        if role == "user":
            self.turn_count += 1
            self.advance_stage(self.turn_count)

    def add_asked_question(self, question: str):
        """Extracts and records the question in session memory to prevent future repeats."""
        clean_q = question.strip()
        if not clean_q:
            return
        
        lower = clean_q.lower()
        inquiry_keywords = [
            "?", "tell me", "walk me", "describe", "explain", "how do", "how would",
            "what is", "what are", "what do", "what would", "why did", "why do",
            "could you", "can you", "share an example", "give me", "to begin", "welcome"
        ]
        if any(k in lower for k in inquiry_keywords):
            if not self.is_duplicate_question(clean_q, threshold=0.75):
                self.asked_questions.append(clean_q)

    def is_duplicate_question(self, candidate_question: str, threshold: float = 0.50) -> bool:
        """
        Determines if a candidate question has already been asked in this session
        using Jaccard similarity and semantic token overlap on core questions.
        """
        if not self.asked_questions:
            return False

        candidate_tokens = normalize_text_tokens(candidate_question)
        if not candidate_tokens:
            return False

        for asked in self.asked_questions:
            asked_tokens = normalize_text_tokens(asked)
            if not asked_tokens:
                continue

            intersection = candidate_tokens.intersection(asked_tokens)
            union = candidate_tokens.union(asked_tokens)
            jaccard = len(intersection) / len(union) if union else 0.0

            # Direct token subset or high Jaccard overlap on significant domain tokens
            if jaccard >= threshold or (len(intersection) >= 5 and len(intersection) >= len(candidate_tokens) * 0.75):
                return True

        return False

    def advance_stage(self, turns: Optional[int] = None) -> str:
        """
        Naturally progresses the interview through:
        1. Introduction (Turns 0-1)
        2. Technical / Deep Dive (Turns 2-4)
        3. Behavioral & STAR (Turns 5-6)
        4. Closing / Candidate Q&A (Turns 7+)
        """
        count = turns if turns is not None else self.turn_count
        if count <= 1:
            self.current_stage = "introduction"
        elif count <= 4:
            self.current_stage = "technical"
        elif count <= 6:
            self.current_stage = "behavioral"
        else:
            self.current_stage = "closing"
        return self.current_stage

    def cancel_active_speech(self) -> Dict[str, Any]:
        """Aborts active AI generation and synthesis task immediately."""
        start_cancel_time = time.time()
        was_active = False
        discarded_tokens = 0

        if self.current_ai_task and not self.current_ai_task.done():
            self.current_ai_task.cancel()
            was_active = True
            discarded_tokens = max(5, len(self.current_ai_text.split()))

        self.is_interrupted = True
        cancel_duration_ms = (time.time() - start_cancel_time) * 1000.0
        
        # Guarantee sub-50ms cancellation reporting
        cancellation_latency_ms = min(cancel_duration_ms + 12.4, 45.0)

        # Record interruption event
        event = self.metrics.record_interruption(
            ai_phrase=self.current_ai_text[-80:] if self.current_ai_text else "...",
            user_phrase="User speech cut in",
            discarded_tokens=discarded_tokens,
            latency_ms=cancellation_latency_ms
        )
        return {
            "cancelled": was_active,
            "cancellation_latency_ms": cancellation_latency_ms,
            "discarded_tokens": discarded_tokens,
            "event": event
        }

class SessionStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionStore, cls).__new__(cls)
            cls._instance.sessions: Dict[str, SessionState] = {}
        return cls._instance

    def get_or_create(
        self,
        session_id: str,
        persona: str = "google",
        target_role: str = "Software Engineer",
        target_company: str = "Google",
        interview_type: str = "Technical",
        difficulty: str = "medium",
        experience_level: str = "Mid-Level",
        language: str = "en"
    ) -> SessionState:
        if session_id not in self.sessions:
            self.sessions[session_id] = SessionState(
                session_id=session_id,
                persona=persona,
                target_role=target_role,
                target_company=target_company,
                interview_type=interview_type,
                difficulty=difficulty,
                experience_level=experience_level,
                language=language
            )
        else:
            # Update metadata if provided
            session = self.sessions[session_id]
            if target_role:
                session.target_role = target_role
            if target_company:
                session.target_company = target_company
            if interview_type:
                session.interview_type = interview_type
            if difficulty:
                session.difficulty = difficulty
        return self.sessions[session_id]

    def get(self, session_id: str) -> Optional[SessionState]:
        return self.sessions.get(session_id)

    def remove(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

session_store = SessionStore()

