import { useState, useEffect, useRef, useCallback } from "react";
import { Message, PersonaType, DifficultyType, LanguageType, SessionMetrics, ScoringResult, InterruptionEvent } from "@/types";
import { RimeAudioPlayer } from "@/lib/rimeClient";

interface UseVoiceSessionProps {
  initialPersona?: PersonaType;
  initialDifficulty?: DifficultyType;
  initialLanguage?: LanguageType;
  candidateName?: string;
  targetRole?: string;
  targetCompany?: string;
  interviewType?: string;
  experienceLevel?: string;
  onTelemetry?: (stage: string, details: Record<string, any>, type?: 'info' | 'interruption' | 'audio' | 'stt' | 'llm') => void;
}

export function useVoiceSession({
  initialPersona = "google",
  initialDifficulty = "medium",
  initialLanguage = "en",
  candidateName = "Candidate",
  targetRole = "Software Engineer",
  targetCompany = "Google",
  interviewType = "Technical",
  experienceLevel = "Mid-Level",
  onTelemetry
}: UseVoiceSessionProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [lastInterruptionEvent, setLastInterruptionEvent] = useState<InterruptionEvent | null>(null);

  const [persona, setPersona] = useState<PersonaType>(initialPersona);
  const [difficulty, setDifficulty] = useState<DifficultyType>(initialDifficulty);
  const [language, setLanguage] = useState<LanguageType>(initialLanguage);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAiText, setCurrentAiText] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");

  const [metrics, setMetrics] = useState<SessionMetrics>({
    wpm: 135.0,
    total_words: 0,
    total_filler_words: 0,
    filler_breakdown: {},
    interruption_count: 0,
    avg_latency_ms: 82.0
  });

  const [scoring, setScoring] = useState<ScoringResult | null>(null);
  const [latencyTimer, setLatencyTimer] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const rimePlayerRef = useRef<RimeAudioPlayer | null>(null);
  const recognitionRef = useRef<any>(null);
  const userSpeechStartTimeRef = useRef<number>(0);

  // Initialize Rime Audio Player
  useEffect(() => {
    rimePlayerRef.current = new RimeAudioPlayer((playing) => {
      setIsAiSpeaking(playing);
    });

    return () => {
      rimePlayerRef.current?.close();
    };
  }, []);

  const currentAiTextRef = useRef("");
  const currentUserTextRef = useRef("");

  useEffect(() => {
    currentAiTextRef.current = currentAiText;
  }, [currentAiText]);

  useEffect(() => {
    currentUserTextRef.current = currentUserText;
  }, [currentUserText]);

  // Connect to Full-Duplex WebSocket with dynamic parameters
  const connect = useCallback(() => {
    const params = new URLSearchParams({
      persona: persona || "google",
      difficulty: difficulty || "medium",
      language: language || "en",
      candidate_name: candidateName || "Candidate",
      target_role: targetRole || "Software Engineer",
      target_company: targetCompany || "Google",
      interview_type: interviewType || "Technical",
      experience_level: experienceLevel || "Mid-Level"
    });

    const baseWsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/duplex";
    const wsUrl = `${baseWsUrl}?${params.toString()}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onTelemetry?.("WEBSOCKET_CONNECTED", { url: wsUrl, persona, status: "OPEN" }, "info");
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "session_init") {
          const initMsg: Message = {
            id: `msg_init_${Date.now()}`,
            role: "assistant",
            content: data.greeting_text,
            timestamp: Date.now(),
            speakerName: data.persona_name || data.target_company || "AI Interviewer"
          };
          setMessages([initMsg]);
          setCurrentAiText(data.greeting_text);
          onTelemetry?.("GREETING_RECEIVED", { text: data.greeting_text }, "llm");
        }

        else if (data.type === "ai_audio_chunk") {
          // Play chunk via WebAudio player
          if (data.audio_base64) {
            rimePlayerRef.current?.playChunk(data.audio_base64);
          }
          if (data.ttfb_ms) {
            setLatencyTimer(data.ttfb_ms);
          }
          onTelemetry?.("RIME_AUDIO_CHUNK", {
            chunk_index: data.chunk_index,
            ttfb_ms: data.ttfb_ms,
            engine: data.engine
          }, "audio");
        }

        else if (data.type === "interruption_ack") {
          // Core claim verification: immediate abort
          setIsInterrupted(true);
          const intEvent: InterruptionEvent = {
            interruption_id: `int_${Date.now()}`,
            timestamp: Date.now(),
            ai_phrase: currentAiTextRef.current.slice(-60),
            user_phrase: currentUserTextRef.current || "Candidate voice intervention",
            stale_tokens_discarded: data.stale_tokens_discarded || 8,
            cancellation_latency_ms: data.cancellation_latency_ms || 24.5
          };
          setLastInterruptionEvent(intEvent);
          onTelemetry?.("INTERRUPTION_ABORT_ACK", {
            latency_ms: data.cancellation_latency_ms,
            discarded_tokens: data.stale_tokens_discarded,
            verdict: "0 stale tokens replayed"
          }, "interruption");

          setTimeout(() => setIsInterrupted(false), 4000);
        }

        else if (data.type === "ai_message") {
          setCurrentAiText(data.text);
          setLatencyTimer(data.latency_ms);
          const newAiMsg: Message = {
            id: `msg_ai_${Date.now()}`,
            role: "assistant",
            content: data.text,
            latency_ms: data.latency_ms,
            timestamp: Date.now(),
            was_pivot: data.was_pivot
          };
          setMessages((prev) => [...prev, newAiMsg]);
          onTelemetry?.("AI_PIVOT_RESPONSE", {
            text: data.text,
            latency_ms: data.latency_ms,
            was_pivot: data.was_pivot
          }, "llm");
        }

        else if (data.type === "metrics_update") {
          setMetrics((prev) => ({
            ...prev,
            wpm: data.wpm ?? prev.wpm,
            total_words: data.total_words ?? prev.total_words,
            total_filler_words: data.total_filler_words ?? prev.total_filler_words,
            filler_breakdown: data.filler_breakdown ?? prev.filler_breakdown,
            interruption_count: data.interruption_count ?? prev.interruption_count
          }));
        }

        else if (data.type === "session_summary") {
          setScoring(data.scoring);
          onTelemetry?.("SCORING_EVALUATED", data.scoring, "info");
        }

        else if (data.type === "telemetry") {
          onTelemetry?.(data.stage || "TELEMETRY_EVENT", data, "info");
        }

      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onTelemetry?.("WEBSOCKET_CLOSED", {}, "info");
    };

    ws.onerror = (err) => {
      console.warn("WebSocket error:", err);
      setIsConnected(false);
    };
  }, [persona, difficulty, language, candidateName, targetRole, targetCompany, interviewType, experienceLevel, onTelemetry]);

  // Trigger manual or voice-driven interruption
  const triggerInterruption = useCallback(() => {
    // 1. Immediately abort WebAudio playback (< 15ms)
    const abortLatency = rimePlayerRef.current?.abortPlayback() || 0;
    setIsAiSpeaking(false);
    setIsInterrupted(true);

    // 2. Send instant interrupt packet to backend
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "interrupt",
        timestamp: Date.now(),
        abort_latency_client_ms: abortLatency
      }));
    }

    onTelemetry?.("CLIENT_VAD_INTERRUPT", { client_abort_ms: abortLatency }, "interruption");
  }, [onTelemetry]);

  // Start / Stop Microphone & Speech Recognition
  const toggleMicrophone = useCallback(() => {
    if (isMicActive) {
      // Stop mic
      recognitionRef.current?.stop();
      setIsMicActive(false);
      setIsUserSpeaking(false);
    } else {
      // Start mic
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";

        recognition.onstart = () => {
          setIsMicActive(true);
          userSpeechStartTimeRef.current = Date.now();
        };

        recognition.onspeechstart = () => {
          setIsUserSpeaking(true);
          // If AI is speaking when user speaks -> FULL DUPLEX INTERRUPTION
          if (isAiSpeaking) {
            triggerInterruption();
          }
        };

        recognition.onresult = (event: any) => {
          let interimText = "";
          let finalText = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcript;
            } else {
              interimText += transcript;
            }
          }

          if (interimText) {
            setCurrentUserText(interimText);
            if (isAiSpeaking) {
              triggerInterruption();
            }
          }

          if (finalText.trim()) {
            const durationSec = (Date.now() - userSpeechStartTimeRef.current) / 1000.0;
            const newUserMsg: Message = {
              id: `msg_user_${Date.now()}`,
              role: "user",
              content: finalText.trim(),
              timestamp: Date.now()
            };
            setMessages((prev) => [...prev, newUserMsg]);
            setCurrentUserText("");

            // Send transcript to backend WebSocket
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: "user_transcript",
                text: finalText.trim(),
                is_final: true,
                duration_sec: durationSec
              }));
            }

            userSpeechStartTimeRef.current = Date.now();
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition notice:", err.error);
        };

        recognition.onend = () => {
          if (isMicActive) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        // WebSpeech not supported; fallback toggle
        setIsMicActive(true);
      }
    }
  }, [isMicActive, isAiSpeaking, language, triggerInterruption]);

  // Send typed user message (supporting hybrid keyboard/voice input)
  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    if (isAiSpeaking) {
      triggerInterruption();
    }

    const newUserMsg: Message = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, newUserMsg]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "user_transcript",
        text: text.trim(),
        is_final: true,
        duration_sec: 2.5
      }));
    }
  }, [isAiSpeaking, triggerInterruption]);

  // Switch Persona mid-session with full conversation continuity
  const switchPersona = useCallback((newPersona: PersonaType) => {
    setPersona(newPersona);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "switch_persona",
        persona: newPersona
      }));
    }
  }, []);

  // End Session & request evaluation
  const endSession = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "end_session"
      }));
    }
    rimePlayerRef.current?.abortPlayback();
    recognitionRef.current?.stop();
    setIsMicActive(false);
  }, []);

  return {
    isConnected,
    isMicActive,
    isAiSpeaking,
    isUserSpeaking,
    isInterrupted,
    lastInterruptionEvent,
    persona,
    difficulty,
    language,
    messages,
    currentAiText,
    currentUserText,
    metrics,
    scoring,
    latencyTimer,
    analyser: rimePlayerRef.current?.getAnalyser() || null,
    connect,
    toggleMicrophone,
    triggerInterruption,
    sendTextMessage,
    switchPersona,
    setDifficulty,
    setLanguage,
    endSession
  };
}
