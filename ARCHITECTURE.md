# 🏗️ EchoHire AI — System Architecture

This document describes the high-level architecture, full-duplex voice pipeline, cancellation lifecycle, and data flow of **EchoHire AI**.

---

## 📐 High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 14 + WebAudio API)"]
        UserMic["🎤 Candidate Microphone"]
        VAD["Voice Activity Detection (Client VAD)"]
        AudioPlayer["RimeAudioPlayer (WebAudio Context)"]
        UI_Stream["Live Conversation Stream & Orb"]
        
        UserMic --> VAD
        VAD -->|Interruption Detected| AbortClient["abortPlayback() (< 18ms)"]
        AbortClient -.->|Flush Audio Buffers| AudioPlayer
    end

    subgraph Transport ["Real-Time Transport Layer"]
        WS["Full-Duplex WebSocket (/ws/duplex)"]
        RTC["LiveKit WebRTC Channel"]
        REST["FastAPI REST Endpoints (/api/*)"]
    end

    subgraph Backend ["Server Layer (FastAPI + Python 3.12)"]
        Router["ws_duplex.py / routes.py"]
        Store["SessionState & Memory Store"]
        Metrics["SessionMetricsTracker (WPM, Fillers)"]
        
        Router <--> Store
        Router --> Metrics
    end

    subgraph VoiceAI ["Voice & AI Orchestration Layer"]
        STT["Deepgram Nova-2 STT"]
        LLM["Google Gemini / OpenAI GPT"]
        TTS["Rime TTS Streaming Service (Mist)"]
        Heuristic["Heuristic Intelligence Engine (Fallback)"]
        
        Router --> STT
        STT --> LLM
        LLM --> TTS
        LLM -.->|Fallback| Heuristic
        Heuristic -.-> TTS
    end

    subgraph Persistence ["Data Layer (SQLite / PostgreSQL)"]
        DB[(SQLAlchemy Engine)]
        UsersTable[(Users Table)]
        SessionsTable[(Sessions Table)]
        MessagesTable[(Messages Table)]
        ScoresTable[(Scores Table)]
        
        DB --- UsersTable
        DB --- SessionsTable
        DB --- MessagesTable
        DB --- ScoresTable
    end

    VAD -->|Voice Frames| WS
    AbortClient -->|Interrupt Packet| WS
    WS <--> Router
    TTS -->|PCM Audio Chunks| WS
    WS -->|Audio Base64| AudioPlayer
    Router --> DB
```

---

## ⚡ Full-Duplex Interruption Lifecycle

The defining capability of EchoHire AI is **instant sub-20ms interruption abort with 0 stale tokens replayed**.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as 👤 Candidate
    participant Browser as 💻 WebAudio (Client)
    participant WS as 🔌 WebSocket
    participant Server as ⚡ FastAPI Backend
    participant Rime as 🎙️ Rime TTS

    Note over Server,Rime: AI is actively streaming audio response...
    Server->>WS: Send AI Audio Chunk (Chunk #3)
    WS->>Browser: Enqueue to WebAudio Buffer
    Browser-->>Candidate: Speaking through Speaker

    Candidate->>Browser: Speaks: "Wait, what about database sharding?"
    activate Browser
    Note over Browser: VAD triggers speech detection
    Browser->>Browser: RimeAudioPlayer.abortPlayback() (< 18ms)
    Note over Browser: Audio stops instantly
    Browser->>WS: Send JSON: { type: "interrupt", timestamp: t1 }
    deactivate Browser

    activate WS
    WS->>Server: Interruption Signal Received
    deactivate WS

    activate Server
    Server->>Server: Cancel active asyncio.Task
    Server->>Rime: Cancel ongoing TTS HTTP Stream
    Server->>Server: SessionState.cancel_active_speech()
    Note over Server: Purge unstreamed tokens (0 stale tokens)
    Server->>WS: Send { type: "interruption_ack", cancellation_ms: 18.4 }
    
    Note over Server: LLM receives interruption context note:
    Note over Server: "[Candidate interrupted prior thought]: Wait, what about database sharding?"
    Server->>Server: Generate contextual pivot response
    Server->>Rime: Synthesize updated response
    Rime-->>Server: Stream new audio chunks
    Server->>WS: Stream updated AI Audio Chunks
    WS->>Browser: Play updated response
    deactivate Server
```

---

## 🧩 Core Architectural Components

### 1. Client-Side WebAudio Controller (`frontend/lib/rimeClient.ts`)
- Manages an isolated `AudioContext` at 24,000 Hz.
- Schedules incoming PCM and WAV chunks with millisecond precision using `AudioBufferSourceNode`.
- Exposes `abortPlayback()` which calls `.stop(0)` on all active audio nodes in **$< 18\text{ ms}$**, eliminating sound buffer lag.

### 2. Full-Duplex WebSocket Engine (`backend/api/ws_duplex.py`)
- Manages bi-directional audio streaming and metadata telemetry.
- Handles `interrupt`, `user_transcript`, `metrics_update`, `switch_persona`, and `end_session` event frames.
- Coordinates cancellation events across `asyncio.Task` instances.

### 3. Multi-Persona Conversational State (`backend/memory/session_store.py`)
- Maintains an in-memory session graph containing multi-turn history, active AI generation tasks, and cancellation tokens.
- Preserves complete context across persona and difficulty adjustments.

### 4. Speech Telemetry & Metrics Tracker (`backend/utils/metrics_tracker.py`)
- Tracks real-time speaking pace in **Words Per Minute (WPM)**.
- Detects filler phrases (`um`, `uh`, `like`, `you know`, `actually`, `basically`, `literally`).
- Logs millisecond-accurate interruption timestamps and latency histograms.

### 5. Multi-Model LLM Orchestration (`backend/agents/interview_agent.py`)
- Priority 1: Google Gemini (`gemini-flash-latest`, `gemini-1.5-flash`).
- Priority 2: OpenAI GPT (`gpt-4o-mini`).
- Priority 3: Built-in Heuristic Intelligence Engine with rich technical templates for AI, ML, Frontend, Backend, Systems, and PM roles.

---

## 🗄️ Database Schema & Relational Model

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : creates
    USERS ||--o{ SCORES : owns
    SESSIONS ||--|{ MESSAGES : contains
    SESSIONS ||--o| SCORES : evaluates

    USERS {
        string id PK
        string name
        string email UK
        string password_hash
        string target_role
        string experience_level
        string target_company
        string interview_type
        string preferred_language
        string difficulty
        boolean is_onboarded
        datetime created_at
    }

    SESSIONS {
        string id PK
        string user_id FK
        string target_role
        string target_company
        string interview_type
        string difficulty
        string language
        string status
        datetime start_time
        datetime end_time
        datetime created_at
    }

    MESSAGES {
        string id PK
        string session_id FK
        string role
        text content
        boolean interrupted
        float latency_ms
        float audio_duration_ms
        datetime timestamp
    }

    SCORES {
        string id PK
        string session_id FK
        string user_id FK
        int overall_score
        int confidence_score
        int clarity_score
        int technical_score
        int star_score
        int communication_score
        float wpm
        int filler_word_count
        int interruption_count
        text strengths_json
        text weaknesses_json
        text tips_json
        datetime created_at
    }
```
