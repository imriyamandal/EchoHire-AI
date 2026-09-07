import io
import math
import struct
import wave
import numpy as np

def generate_wav_header(sample_rate: int = 24000, num_channels: int = 1, bits_per_sample: int = 16, data_size: int = 0) -> bytes:
    """Generates standard 44-byte RIFF WAV header."""
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    file_size = 36 + data_size

    header = bytearray()
    header.extend(b'RIFF')
    header.extend(struct.pack('<I', file_size))
    header.extend(b'WAVE')
    header.extend(b'fmt ')
    header.extend(struct.pack('<I', 16)) # Subchunk1Size (16 for PCM)
    header.extend(struct.pack('<H', 1))  # AudioFormat (1 for PCM)
    header.extend(struct.pack('<H', num_channels))
    header.extend(struct.pack('<I', sample_rate))
    header.extend(struct.pack('<I', byte_rate))
    header.extend(struct.pack('<H', block_align))
    header.extend(struct.pack('<H', bits_per_sample))
    header.extend(b'data')
    header.extend(struct.pack('<I', data_size))
    return bytes(header)

def create_synthesized_pcm_chunk(text: str, duration_sec: float = 1.0, sample_rate: int = 24000) -> bytes:
    """
    Creates a pleasant harmonic vocal-formant audio wave for development/offline mode.
    Simulates vocal pitch contours with formants (F1, F2) to sound like human vocal cadence.
    """
    total_samples = int(duration_sec * sample_rate)
    t = np.linspace(0, duration_sec, total_samples, endpoint=False)

    # Base pitch with natural intonation curve (sentence cadence)
    base_freq = 150 + 20 * np.sin(2 * np.pi * 1.5 * t)
    phase = 2 * np.pi * np.cumsum(base_freq) / sample_rate

    # Formant resonances for speech-like harmonic timbre (vowel resonance)
    harmonics = (
        0.5 * np.sin(phase) +
        0.3 * np.sin(2 * phase) +
        0.2 * np.sin(3 * phase) +
        0.15 * np.sin(4 * phase) +
        0.08 * np.sin(5 * phase)
    )

    # Envelope with natural syllabic pulses
    syllable_freq = max(3.0, len(text.split()) * 2.5 / max(duration_sec, 0.5))
    syllable_envelope = 0.5 + 0.5 * np.cos(2 * np.pi * syllable_freq * t)
    
    # Attack and decay fade to prevent pops
    fade_len = min(int(0.05 * sample_rate), total_samples // 4)
    fade_in = np.linspace(0, 1, fade_len)
    fade_out = np.linspace(1, 0, fade_len)
    window = np.ones(total_samples)
    window[:fade_len] = fade_in
    window[-fade_len:] = fade_out

    audio_signal = harmonics * syllable_envelope * window * 0.35
    pcm_data = (audio_signal * 32767).astype(np.int16)
    return pcm_data.tobytes()

def pcm_to_wav_bytes(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1) -> bytes:
    """Wraps raw 16-bit PCM bytes into a valid WAV container bytes."""
    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    return wav_io.getvalue()
