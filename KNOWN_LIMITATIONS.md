# ⚠️ EchoHire AI — Known Limitations & Future Roadmap

This document provides transparent documentation of current browser environment nuances, edge cases, and future enhancements.

---

## 🌐 Browser & Environmental Constraints

1. **Microphone Permissions in Web Browsers**:
   - Modern browsers (Chrome, Edge, Safari, Brave) require explicit user consent to access the microphone.
   - If microphone permissions are denied, the platform gracefully switches to text-input mode with the floating keyboard controller.

2. **Web Speech API Availability**:
   - The browser-native `SpeechRecognition` interface is fully supported on Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Opera) and Safari.
   - On browsers without Web Speech API (e.g., standard Firefox without flags), EchoHire AI utilizes Deepgram STT audio streaming and hybrid text input.

3. **Audio Autoplay Policies**:
   - WebAudio `AudioContext` instances require a user gesture (e.g. clicking "Enter Studio" or the Voice Orb) to transition from `suspended` to `running` state. EchoHire AI handles this automatically upon user interaction.

4. **Third-Party API Rate Limits**:
   - If external API quotas (e.g. OpenAI or Gemini) are exhausted, EchoHire AI automatically falls back to its built-in **Heuristic Intelligence Engine** with zero service interruption.

---

## 🗺️ Future Scope & Roadmap

- [ ] **Multi-Interviewer Panel Mode**: Simulate 2–3 simultaneous interviewers with distinct vocal profiles debating system design tradeoffs.
- [ ] **Live Video & Computer Vision Telemetry**: Real-time facial sentiment, eye-contact estimation, and body language analysis via WebRTC video tracks.
- [ ] **Custom Company Interview Question Importer**: Allow candidates or enterprise hiring teams to upload bespoke job descriptions and rubrics.
- [ ] **Fine-Tuned Specialized Evaluation Models**: Host self-contained quantized models on GPU endpoints for offline enterprise compliance.
- [ ] **Mobile Native iOS & Android Apps**: Native low-latency audio capture using Swift and Kotlin WebRTC SDKs.
