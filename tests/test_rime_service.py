import pytest
import asyncio
from backend.voice.rime_service import rime_service

@pytest.mark.asyncio
async def test_rime_audio_streaming():
    """Verifies Rime TTS chunk streaming and TTFB measurement."""
    sample_text = "Welcome to EchoHire AI. Let's begin your technical system design interview."
    chunks = []
    
    async for chunk in rime_service.stream_audio_chunks(sample_text, speaker="celeste"):
        chunks.append(chunk)

    assert len(chunks) > 0
    first_chunk = chunks[0]
    assert "audio_bytes" in first_chunk
    assert first_chunk["ttfb_ms"] >= 0
    print(f"\n[RIME TTS TEST PASS] Total chunks: {len(chunks)}, First chunk TTFB: {first_chunk['ttfb_ms']}ms, Engine: {first_chunk.get('engine')}")

@pytest.mark.asyncio
async def test_rime_wav_synthesis():
    """Verifies that full WAV synthesis produces valid RIFF WAV header."""
    sample_text = "Testing EchoHire audio synthesis."
    wav_bytes = await rime_service.synthesize_full_wav(sample_text, persona="google")
    assert wav_bytes.startswith(b"RIFF")
    assert b"WAVE" in wav_bytes[:16]
    assert len(wav_bytes) > 1000
    print(f"\n[RIME WAV SYNTHESIS PASS] Generated WAV size: {len(wav_bytes)} bytes.")
