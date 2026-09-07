"use client";

import React from "react";
import { Mic, MicOff, Volume2, Sparkles, Zap, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceOrbProps {
  isMicActive: boolean;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  isInterrupted: boolean;
  isProcessing?: boolean;
  onToggleMic: () => void;
  className?: string;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isMicActive,
  isAiSpeaking,
  isUserSpeaking,
  isInterrupted,
  isProcessing = false,
  onToggleMic,
  className
}) => {
  // Voice State definition
  const voiceState = isInterrupted
    ? "interrupted"
    : isUserSpeaking
    ? "listening"
    : isAiSpeaking
    ? "speaking"
    : isProcessing
    ? "processing"
    : isMicActive
    ? "active"
    : "idle";

  return (
    <div className={cn("relative flex flex-col items-center justify-center select-none py-6", className)}>
      {/* Outer Acoustic Ripple Layers */}
      <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60">
        {/* Layer 1: Ambient Background Glow Sphere */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none",
            voiceState === "speaking" && "bg-purple-600/35 scale-125",
            voiceState === "listening" && "bg-cyan-500/35 scale-125",
            voiceState === "interrupted" && "bg-amber-500/40 scale-135",
            voiceState === "active" && "bg-blue-600/25 scale-110",
            voiceState === "idle" && "bg-blue-600/15 scale-100"
          )}
        />

        {/* Layer 2: Concentric Ripple Rings (when listening or speaking) */}
        {(voiceState === "listening" || voiceState === "speaking") && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full border border-cyan-400/40 animate-ripple-1 pointer-events-none",
              voiceState === "speaking" && "border-purple-400/40"
            )} />
            <div className={cn(
              "absolute inset-0 rounded-full border border-cyan-400/30 animate-ripple-2 pointer-events-none",
              voiceState === "speaking" && "border-purple-400/30"
            )} />
            <div className={cn(
              "absolute inset-0 rounded-full border border-blue-400/20 animate-ripple-3 pointer-events-none"
            )} />
          </>
        )}

        {/* Layer 3: Rotating Ring for Processing / Thinking */}
        {voiceState === "processing" && (
          <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-400 animate-spin-slow pointer-events-none" />
        )}

        {/* Layer 4: Interruption Ripple Burst */}
        {voiceState === "interrupted" && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping duration-700 pointer-events-none" />
        )}

        {/* MAIN GIANT ORB CORE (Clickable) */}
        <button
          onClick={onToggleMic}
          type="button"
          aria-label={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
          className={cn(
            "relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl active:scale-95 group",
            voiceState === "speaking" && "bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 shadow-glow-purple scale-105",
            voiceState === "listening" && "bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-glow-cyan scale-105",
            voiceState === "interrupted" && "bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-600 shadow-lg scale-105",
            voiceState === "active" && "bg-gradient-to-tr from-blue-700 via-indigo-700 to-slate-900 shadow-glow-blue animate-orb-breath",
            voiceState === "idle" && "bg-gradient-to-tr from-slate-900 via-[#111827] to-slate-800 border border-white/[0.08] hover:border-blue-500/40"
          )}
        >
          {/* Inner Gloss & Particle Aura */}
          <div className="absolute inset-2 rounded-full bg-white/[0.04] backdrop-blur-xs border border-white/[0.15] pointer-events-none" />
          
          {/* Central Icon */}
          <div className="relative z-20 flex flex-col items-center justify-center text-white">
            {voiceState === "speaking" ? (
              <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
            ) : voiceState === "listening" ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-200 animate-bounce" />
            ) : voiceState === "interrupted" ? (
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-pulse" />
            ) : isMicActive ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <MicOff className="w-9 h-9 sm:w-10 sm:h-10 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </div>
        </button>
      </div>

      {/* Spoken State Friendly Capsule Pill */}
      <div className="mt-4 flex items-center justify-center">
        {voiceState === "interrupted" ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/50 text-amber-300 text-xs font-semibold shadow-md animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Listening... I caught your interruption.</span>
          </div>
        ) : voiceState === "listening" ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-glow-cyan animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Listening to You... (Full-Duplex)</span>
          </div>
        ) : voiceState === "speaking" ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-glow-purple">
            <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI Speaking • Speak anytime to interrupt</span>
          </div>
        ) : isMicActive ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mic Live • Ready for your answer</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
            <span>Click the orb or press Space to start speaking</span>
          </div>
        )}
      </div>
    </div>
  );
};
