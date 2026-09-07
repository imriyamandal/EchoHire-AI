import os
import json
import time
import logging
import httpx
from typing import Dict, Any, Optional
from backend.utils.config import settings

logger = logging.getLogger("echohire.deepgram")

class DeepgramSTTService:
    def __init__(self):
        self.api_key = settings.DEEPGRAM_API_KEY
        self.api_url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&filler_words=true"
        self.has_valid_key = bool(self.api_key and len(self.api_key) > 5 and not self.api_key.startswith("your_"))
        logger.info(f"DeepgramSTTService initialized. Cloud Key configured: {self.has_valid_key}")

    async def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/wav") -> Dict[str, Any]:
        """
        Transcribes raw audio bytes using Deepgram Nova-2 STT.
        """
        start_time = time.time()
        
        if self.has_valid_key:
            try:
                headers = {
                    "Authorization": f"Token {self.api_key}",
                    "Content-Type": mime_type
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(self.api_url, content=audio_bytes, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        results = data.get("results", {})
                        channels = results.get("channels", [{}])
                        alternatives = channels[0].get("alternatives", [{}])
                        transcript = alternatives[0].get("transcript", "")
                        confidence = alternatives[0].get("confidence", 0.95)
                        words = alternatives[0].get("words", [])

                        latency_ms = (time.time() - start_time) * 1000.0
                        return {
                            "transcript": transcript,
                            "confidence": round(confidence * 100, 1),
                            "words": words,
                            "latency_ms": round(latency_ms, 2),
                            "engine": "deepgram-nova-2"
                        }
                    else:
                        logger.warning(f"Deepgram API error status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Deepgram transcription failed: {e}")

        # Fallback simulation for offline testing
        latency_ms = (time.time() - start_time) * 1000.0
        return {
            "transcript": "",
            "confidence": 95.0,
            "words": [],
            "latency_ms": round(latency_ms, 2),
            "engine": "deepgram-fallback"
        }

deepgram_service = DeepgramSTTService()
