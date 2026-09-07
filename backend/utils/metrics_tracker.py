import re
import time
from typing import List, Dict, Any

FILLER_WORDS = [
    "um", "uh", "like", "you know", "actually", "basically",
    "literally", "sort of", "kind of", "i mean", "so yeah", "honestly"
]

class SessionMetricsTracker:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.start_time = time.time()
        self.user_word_count = 0
        self.user_speaking_duration_sec = 0.0
        self.filler_words_detected: Dict[str, int] = {}
        self.interruption_count = 0
        self.interruption_events: List[Dict[str, Any]] = []
        self.latencies_ms: List[float] = []

    def analyze_user_speech(self, text: str, duration_sec: float = 0.0) -> Dict[str, Any]:
        """Analyzes a block of user transcribed speech for pace and filler words."""
        cleaned = text.lower()
        words = re.findall(r'\b\w+\b', cleaned)
        word_count = len(words)
        self.user_word_count += word_count
        if duration_sec > 0:
            self.user_speaking_duration_sec += duration_sec
        else:
            # Estimate duration based on average speaking pace if not provided
            self.user_speaking_duration_sec += max(1.0, word_count / 2.3)

        detected_in_chunk = {}
        for fw in FILLER_WORDS:
            # Look for phrase or word boundary
            matches = len(re.findall(r'\b' + re.escape(fw) + r'\b', cleaned))
            if matches > 0:
                self.filler_words_detected[fw] = self.filler_words_detected.get(fw, 0) + matches
                detected_in_chunk[fw] = matches

        current_wpm = self.calculate_wpm()
        return {
            "chunk_word_count": word_count,
            "total_words": self.user_word_count,
            "filler_words_in_chunk": detected_in_chunk,
            "total_filler_words": sum(self.filler_words_detected.values()),
            "wpm": current_wpm
        }

    def record_interruption(self, ai_phrase: str, user_phrase: str, discarded_tokens: int, latency_ms: float):
        """Records an interruption event with millisecond latency telemetry."""
        self.interruption_count += 1
        event = {
            "timestamp": time.time(),
            "interruption_id": f"int_{self.interruption_count}_{int(time.time()*1000)}",
            "ai_phrase": ai_phrase,
            "user_phrase": user_phrase,
            "stale_tokens_discarded": discarded_tokens,
            "cancellation_latency_ms": round(latency_ms, 2)
        }
        self.interruption_events.append(event)
        return event

    def record_latency(self, latency_ms: float):
        self.latencies_ms.append(latency_ms)

    def calculate_wpm(self) -> float:
        if self.user_speaking_duration_sec <= 0:
            return 130.0
        minutes = self.user_speaking_duration_sec / 60.0
        return round(self.user_word_count / minutes, 1) if minutes > 0 else 130.0

    def get_summary(self) -> Dict[str, Any]:
        total_filler_count = sum(self.filler_words_detected.values())
        avg_latency = round(sum(self.latencies_ms) / len(self.latencies_ms), 1) if self.latencies_ms else 85.0
        return {
            "session_id": self.session_id,
            "duration_sec": round(time.time() - self.start_time, 1),
            "total_words": self.user_word_count,
            "wpm": self.calculate_wpm(),
            "filler_words_total": total_filler_count,
            "filler_breakdown": self.filler_words_detected,
            "interruption_count": self.interruption_count,
            "interruption_events": self.interruption_events,
            "avg_latency_ms": avg_latency
        }
