# 🔑 EchoHire AI — API & Credentials Configuration Guide

EchoHire AI integrates industry-leading voice, speech-to-text, WebRTC, and LLM technologies. This guide explains how to obtain, configure, and verify each provider.

---

## 📑 Summary of Providers

| Provider | Purpose | Default Model | Fallback Available? |
|---|---|---|---|
| **Rime TTS** | Primary expressive voice output | `mist` (`allison`, `amber`, `creek`, `marsh`) | ✅ High-fidelity harmonic synthesizer |
| **Deepgram** | Real-time speech-to-text | `nova-2` | ✅ Client-side WebSpeech / fallback |
| **LiveKit** | Low-latency WebRTC audio transport | Cloud Agent WebRTC | ✅ Signed token generator / WebSocket duplex |
| **Google Gemini** | Real-time technical reasoning & scoring | `gemini-flash-latest` | ✅ Heuristic Intelligence Engine |
| **OpenAI** | Secondary LLM provider | `gpt-4o-mini` | ✅ Heuristic Intelligence Engine |

---

## 1. 🎙️ Rime TTS Setup (Primary Voice Engine)

**Rime** generates expressive, human-like voice synthesis with sub-100ms Time-to-First-Audio.

1. Create an account at [rime.ai](https://rime.ai).
2. Generate an API Key in your dashboard.
3. Add the key to `.env`:
   ```env
   RIME_API_KEY=your_rime_api_key_here
   RIME_DEFAULT_SPEAKER=allison
   RIME_MODEL_ID=mist
   RIME_API_URL=https://users.rime.ai/v1/rime-tts
   RIME_WS_URL=wss://users-ws.rime.ai/ws3
   ```
4. **Supported Mist Voices**:
   - `allison` — Google / Systems / Staff Engineer (analytical & clear)
   - `amber` — Amazon / Bar Raiser (structured & direct)
   - `creek` — Startup / CTO / OpenAI (energetic & fast-paced)
   - `marsh` — HR & Culture Fit (warm & empathetic)
   - `bayou` — Meta / Microsoft (pragmatic & resonant)

---

## 2. ⚡ Deepgram STT Setup (Speech Recognition)

**Deepgram Nova-2** provides fast speech-to-text with punctuation, interim word streaming, and filler word detection.

1. Sign up at [deepgram.com](https://deepgram.com).
2. Create an API Key in the Deepgram Console.
3. Add the key to `.env`:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

---

## 3. 🌐 LiveKit WebRTC Setup (Real-Time Audio)

**LiveKit** provides ultra-low latency WebRTC rooms and server-side voice agents.

1. Create a free project at [cloud.livekit.io](https://cloud.livekit.io).
2. Retrieve your **WebSocket URL**, **API Key**, and **API Secret**.
3. Add them to `.env`:
   ```env
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_livekit_api_key_here
   LIVEKIT_API_SECRET=your_livekit_api_secret_here
   ```

---

## 4. 🧠 Google Gemini Setup (LLM Reasoning)

**Google Gemini** powers dynamic interview generation, follow-up questions, and STAR rubric scoring.

1. Get a free API Key from [Google AI Studio](https://aistudio.google.com).
2. Add the key to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-latest
   ```

---

## 5. 🤖 OpenAI Setup (Optional Secondary LLM)

1. Get an API Key at [platform.openai.com](https://platform.openai.com).
2. Add to `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```

---

## 🛡️ Built-in Zero-Config Fallback Behavior

EchoHire AI was designed for mission-critical reliability:
- **No Rime Key?** The server automatically uses our procedural harmonic synthesizer, creating vocal-formant audio streaming without throwing errors.
- **No Gemini/OpenAI Key?** The built-in **Heuristic Intelligence Engine** analyzes candidate input and returns role-specific technical probing questions.
- **No Deepgram Key?** The browser's native WebSpeech API seamlessly transcribes user speech.
- **No LiveKit Cloud?** The full-duplex WebSocket channel (`/ws/duplex`) routes streaming audio chunks seamlessly.
