import os
import json
import time
import asyncio
import logging
import httpx
import websockets
from typing import AsyncGenerator, Optional, Dict, Any
from backend.utils.config import settings
from backend.utils.audio_utils import create_synthesized_pcm_chunk, pcm_to_wav_bytes

logger = logging.getLogger("echohire.rime")

RIME_VOICES = {
    "google": "allison",    # Sharp, analytical, clear
    "amazon": "amber",      # Direct, structured, bar raiser
    "startup": "creek",     # Dynamic, fast-paced, enthusiastic
    "hr": "marsh",          # Warm, empathetic, collaborative
    "meta": "bayou",        # Pragmatic, system-scale
    "microsoft": "marsh",   # Collaborative, enterprise
    "apple": "allison",     # Precision, elegance
    "openai": "creek",      # Frontier research, agile
    "default": "allison"
}

class RimeTTSService:
    def __init__(self):
        self.api_key = settings.RIME_API_KEY
        self.api_url = settings.RIME_API_URL
        self.ws_url = settings.RIME_WS_URL
        self.default_model = settings.RIME_MODEL_ID
        self.has_valid_key = bool(self.api_key and len(self.api_key) > 5 and not self.api_key.startswith("your_"))
        logger.info(f"RimeTTSService initialized. Cloud Key configured: {self.has_valid_key}")

    def get_speaker_for_persona(self, persona: str) -> str:
        return RIME_VOICES.get(persona.lower(), RIME_VOICES["default"])

    async def stream_audio_chunks(
        self,
        text: str,
        speaker: Optional[str] = None,
        model_id: Optional[str] = None,
        speed_alpha: float = 1.0,
        lang: str = "eng",
        cancel_event: Optional[asyncio.Event] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams audio chunks from Rime TTS with sub-100ms TTFB.
        Yields dicts with:
        {
            "chunk_index": int,
            "pcm_base64": Optional[str],
            "audio_bytes": bytes,
            "ttfb_ms": float,
            "is_final": bool
        }
        """
        start_time = time.time()
        speaker = speaker or settings.RIME_DEFAULT_SPEAKER
        model_id = model_id or self.default_model

        if self.has_valid_key:
            # 1. Attempt Rime Cloud Streaming
            try:
                chunk_idx = 0
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "audio/pcm"
                }
                payload = {
                    "text": text,
                    "speaker": speaker,
                    "modelId": model_id,
                    "speedAlpha": speed_alpha,
                    "lang": lang,
                    "samplingRate": 24000
                }
                
                async with httpx.AsyncClient(timeout=10.0) as client:
                    async with client.stream("POST", self.api_url, json=payload, headers=headers) as response:
                        if response.status_code == 200:
                            async for raw_chunk in response.aiter_bytes(chunk_size=4096):
                                if cancel_event and cancel_event.is_set():
                                    logger.info("Rime TTS stream cancelled mid-flight by user interruption.")
                                    return

                                ttfb = (time.time() - start_time) * 1000.0
                                yield {
                                    "chunk_index": chunk_idx,
                                    "audio_bytes": raw_chunk,
                                    "ttfb_ms": round(ttfb, 2),
                                    "is_final": False,
                                    "engine": "rime-cloud"
                                }
                                chunk_idx += 1

                            yield {
                                "chunk_index": chunk_idx,
                                "audio_bytes": b"",
                                "ttfb_ms": round((time.time() - start_time) * 1000.0, 2),
                                "is_final": True,
                                "engine": "rime-cloud"
                            }
                            return
                        else:
                            logger.warning(f"Rime API returned status {response.status_code}: {await response.aread()}")
            except Exception as e:
                logger.error(f"Rime Cloud API call failed: {e}. Falling back to high-res local synthesis.")

        # 2. Resilient High-Speed Synthesizer (for zero-latency local testing & offline hackathon demo)
        words = text.split()
        total_chunks = max(2, len(words) // 4)
        chunk_duration = 0.35

        for i in range(total_chunks):
            if cancel_event and cancel_event.is_set():
                logger.info(f"Local synthesis cancelled at chunk {i}/{total_chunks}.")
                return

            sub_text = " ".join(words[i*4 : (i+1)*4]) if words else text
            pcm_chunk = create_synthesized_pcm_chunk(sub_text, duration_sec=chunk_duration)
            ttfb = (time.time() - start_time) * 1000.0
            
            # Natural streaming pacing
            await asyncio.sleep(0.08)

            yield {
                "chunk_index": i,
                "audio_bytes": pcm_chunk,
                "ttfb_ms": round(ttfb, 2),
                "is_final": (i == total_chunks - 1),
                "engine": "rime-local-synthesizer"
            }

    async def synthesize_full_wav(self, text: str, persona: str = "google") -> bytes:
        """Synthesizes complete speech audio as WAV bytes."""
        speaker = self.get_speaker_for_persona(persona)
        pcm_chunks = []
        async for chunk_info in self.stream_audio_chunks(text, speaker=speaker):
            if chunk_info["audio_bytes"]:
                pcm_chunks.append(chunk_info["audio_bytes"])
        
        full_pcm = b"".join(pcm_chunks)
        return pcm_to_wav_bytes(full_pcm, sample_rate=24000)

rime_service = RimeTTSService()
