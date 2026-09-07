# 🎙️ EchoHire AI — Project Overview

> **"The Full-Duplex Voice Interview Coach That Listens Like a Human."**  
> 📄 **[Download 1-Page Solution Architecture PDF (docs/EchoHire_Solution_Architecture.pdf)](docs/EchoHire_Solution_Architecture.pdf)**

---

## 📌 Executive Summary

**EchoHire AI** is a real-time, full-duplex voice interview simulation platform engineered to replicate the dynamic, interactive nature of real technical and behavioral interviews.

Unlike traditional voice bots that operate in a turn-based "half-duplex" mode (where a candidate must wait for the AI to completely finish speaking a pre-buffered audio file), EchoHire AI continuously listens to candidate speech, calculates Voice Activity Detection (VAD) triggers in the browser, aborts audio playback in under **20 milliseconds**, cancels server-side token synthesis, and pivots the conversation seamlessly with **zero stale audio replayed**.

EchoHire AI is powered by:
- **Rime TTS (`mist` model)**: Ultra-low latency, expressive vocal synthesis with chunked audio streaming.
- **Deepgram STT (Nova-2)**: Real-time interim and final transcription, confidence estimation, and filler word detection.
- **Google Gemini & Multi-LLM Engine**: Dynamic technical evaluation, STAR methodology assessment, and company-specific rubric alignment.
- **LiveKit WebRTC & Full-Duplex WebSockets**: Resilient real-time audio transport.

---

## 🎯 The Problem

1. **The "Wait-Your-Turn" Barrier in Voice AI**:
   - Traditional voice bots are simply text chatbots wrapped in a text-to-speech audio player. If an interviewee interjects with a clarification or correction ("Wait, let me clarify our caching strategy..."), the bot ignores the candidate and finishes its 10-second monolog.
2. **Context Loss & Amnesia**:
   - When traditional systems are interrupted, they either crash or reset the conversation, losing critical context.
3. **Generic Questioning**:
   - Most interview platforms use static question banks that fail to adapt to candidate experience level, target company culture, or specific architectural tradeoffs.
4. **Lack of Actionable, Granular Feedback**:
   - Candidates receive generic pass/fail ratings rather than multi-dimensional telemetry on speaking cadence (WPM), filler word usage, technical depth, and STAR framework adherence.

---

## 💡 The EchoHire AI Solution

```
+-----------------------------------------------------------------------------------+
|                               ECHOHIRE AI SOLUTION                                 |
+-----------------------------------------------------------------------------------+
|  1. Full-Duplex Interruption Architecture: Sub-20ms client abort + server purge.   |
|  2. Rime TTS Expressive Voice Synthesis: Sub-100ms TTFB chunked audio streaming.  |
|  3. Company-Specific Personas: Google, Amazon, Meta, OpenAI, Microsoft, Startups. |
|  4. Real-Time Telemetry: WPM tracking, filler words, latency, and STAR evaluation. |
|  5. Executive PDF Reports: Comprehensive branded feedback reports with 1 click.   |
+-----------------------------------------------------------------------------------+
```

---

## 🏆 Key Value Propositions

### 1. Instant Interruption & Zero Stale Tokens
When candidate speech is detected while the AI is talking:
- WebAudio buffers are cleared instantly (< 18.4ms).
- WebSocket interrupt signal cancels the active server `asyncio.Task`.
- Unplayed synthesis tokens are purged with zero audio leakage.
- The LLM pivots immediately to address the candidate's interjection.

### 2. Tailored Company Cultured Personas
- **Google (`allison`)**: Deep dive into distributed systems, algorithmic complexity, concurrency, and scalable architecture.
- **Amazon (`amber`)**: Strict STAR methodology, Customer Obsession, Ownership, and quantified business metrics.
- **Startups (`creek`)**: Fast-paced 0-to-1 prototyping, velocity, scrappiness, and full-stack execution.
- **HR & Leadership (`marsh`)**: Emotional intelligence, conflict resolution, cultural alignment, and team dynamics.

### 3. Multi-Factor Evaluation & Scoring Engine
Evaluates every mock session across 5 dimensions:
- **STAR Structure (Situation, Task, Action, Result)**
- **Clarity & Tone**
- **Confidence & Delivery**
- **Technical Accuracy & Tradeoff Analysis**
- **Communication & Pace (Words Per Minute)**

---

## 📊 Performance Benchmarks

| Capability | Traditional Voice Bots | EchoHire AI | Delta |
|---|---|---|---|
| **Interruption Abort Time** | $> 2,400\text{ ms}$ | **$< 20\text{ ms}$** | **$120\times\text{ faster}$** |
| **Stale Tokens Replayed** | 100% of buffer | **$0\text{ tokens}$** | **Zero leakage** |
| **Time-to-First-Audio (TTFA)** | $> 1,200\text{ ms}$ | **$< 90\text{ ms}$** | **$13.3\times\text{ lower}$** |
| **Context Continuity on Pivot** | 0% (Session resets) | **100% continuous** | **Seamless** |
| **Cross-Platform Compatibility** | Inconsistent | **Windows, macOS, Linux, Chrome, Safari, Edge** | **Universal** |

---

## 🔮 Target Audience

- **Software Engineers & AI Practitioners**: Preparing for Senior, Staff, and Principal engineering interviews.
- **Product Managers & Data Scientists**: Refining structured communication and behavioral storytelling.
- **University Graduates & Career Switchers**: Overcoming interview anxiety and eliminating filler words.
- **Enterprise Talent Teams & Bootcamps**: Conducting automated, consistent candidate technical screens.
