# DEMO_SCRIPT.md — EchoHire AI: 4–5 Minute Winning Pitch Demo

## Presentation Metadata
- **Product:** EchoHire AI ("The Interview Coach That Listens Like a Human")
- **Target Event:** Rime Voice Hackathon
- **Presenter Role:** Founder & Senior AI Voice Engineer
- **Total Duration:** 4 minutes 30 seconds

---

## Demo Timeline & Stage Directions

### [0:00 – 0:35] The Hook & Problem Statement
- **Camera:** Full screen presenter face, switching to landing page hero.
- **Presenter:** 
  > "Judges, every human conversation has one defining quality: it changes the moment you speak up. Yet, almost every voice AI built today is just a chatbot with a 'play audio' button. You interrupt them, and they keep talking over you or play out 5 seconds of stale words. Today, we've solved this with **EchoHire AI** — the first full-duplex interview coach powered by Rime TTS that listens, stops in under 30 milliseconds, and adapts like a real human interviewer."

---

### [0:35 – 1:30] Standard Interview Flow & Rime Prosody
- **Screen:** Navigate to `/interview` with Google Persona (Alex Chen).
- **Action:** Click "Start Mock Interview". Alex Chen speaks:
  > *"Hi! I'm Alex from the engineering team. Today we'll do a technical dive into distributed systems and architecture. To start off, could you walk me through a system you designed that had to handle unpredictable traffic spikes?"*
- **Presenter:** 
  > *"Notice the natural vocal cadence, pitch intonation, and sub-90ms Time-to-First-Audio powered by Rime TTS's Mist model."*
- **Action:** Candidate answers:
  > *"At my previous startup, our payment gateway experienced 5x traffic surges during flash sales. We implemented Redis caching and asynchronous queue workers..."*

---

### [1:30 – 2:30] The "Wow Moment": Instant Full-Duplex Interruption
- **Screen:** AI begins a lengthy response on cache invalidation tradeoffs.
  > *"Interesting architecture choice. When you distribute traffic across read replicas, data consistency becomes a primary tradeoff. In a situation where..."*
- **Action (THE MOMENT):** Presenter speaks right in the middle of Alex's sentence:
  > **"Wait Alex, what if we used DynamoDB global tables with eventual consistency instead?"**
- **Visual:**
  - Speaker output **instantly cuts off (< 30ms)**.
  - Red **"⚡ INSTANT INTERRUPTION DETECTED"** banner flashes with **"Purged in 22.4ms — 0 Stale Tokens Replayed"**.
  - Alex Chen immediately pivots:
    > *"Got it! Pivoting to DynamoDB. With global tables, how would you resolve conflict resolution during concurrent cross-region writes?"*
- **Presenter:**
  > *"Did you see that? The moment I spoke, EchoHire aborted active playback in 22 milliseconds, purged the unplayed audio buffer, and pivoted the conversation without replaying a single stale syllable."*

---

### [2:30 – 3:15] Judge Mode Deep Dive (`Ctrl + Shift + J`)
- **Action:** Press `Ctrl + Shift + J` to trigger the Judge Mode HUD.
- **Screen:** Architecture Inspector opens showing the live WebRTC/WebSocket pipeline, cancellation tokens, and Rime streaming chunks.
- **Presenter:**
  > *"Let's open Judge Mode. Here you can see our real-time WebAudio abort controller, Rime TTS chunk stream telemetry, and zero-stale-token verification logged live in milliseconds."*

---

### [3:15 – 3:45] Persona & Multilingual Continuity
- **Action:** Select "Marcus Vance (Amazon Bar Raiser)" from the dropdown and switch language to Hinglish.
- **Screen:** Marcus immediately greets with strict Amazon STAR leadership focus in conversational Hinglish, retaining the context of our previous DynamoDB discussion without resetting the session.

---

### [3:45 – 4:30] Session Analytics & Executive PDF Export
- **Action:** Click "End & Review" -> `/summary`.
- **Screen:** Confetti bursts; the Circular Scorecard (88/100) displays STAR breakdown, speaking speed (138 WPM), filler word count (2), and strengths/weaknesses.
- **Action:** Click **"Download PDF Report"** -> Opens formatted executive assessment PDF.
- **Presenter Closing:**
  > *"EchoHire AI proves that voice AI isn't just about speaking fast—it's about listening like a human. Thank you!"*

---

## Backup Demo Plan
- **Offline / Zero-Cloud Fallback:** If internet connection drops during presentation, EchoHire AI automatically switches to its internal local high-fidelity audio synthesizer and local intelligence engine, preserving 100% of all UI animations, full-duplex interruption aborts, and PDF generation with 0 downtime.
