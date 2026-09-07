"use client";

import React from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  isMicActive: boolean;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  onClick: () => void;
  className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isMicActive,
  isAiSpeaking,
  isUserSpeaking,
  onClick,
  className
}) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer pulsing acoustic ripple rings when active */}
      {isMicActive && (
        <>
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-ping duration-1000 pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full bg-cyan-500/30 animate-pulse pointer-events-none" />
        </>
      )}

      {isUserSpeaking && (
        <div className="absolute w-28 h-28 rounded-full border-2 border-cyan-400/60 animate-glow-pulse pointer-events-none" />
      )}

      <button
        onClick={onClick}
        aria-label={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
        className={cn(
          "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 cursor-pointer",
          isMicActive
            ? isUserSpeaking
              ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-glow-cyan ring-4 ring-cyan-500/30 scale-105"
              : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-glow-blue ring-4 ring-blue-500/20"
            : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
        )}
      >
        {isMicActive ? (
          <Mic className="w-7 h-7 animate-pulse" />
        ) : (
          <MicOff className="w-7 h-7" />
        )}
      </button>

      {/* Spoken State Capsule Tag */}
      <div className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-300">
        {isUserSpeaking ? (
          <span className="text-cyan-300 bg-cyan-950/60 border-cyan-500/40 animate-pulse">
            Listening to You...
          </span>
        ) : isAiSpeaking ? (
          <span className="text-blue-300 bg-blue-950/60 border-blue-500/40 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-bounce" /> AI Speaking (Interrupt anytime)
          </span>
        ) : isMicActive ? (
          <span className="text-emerald-400 bg-emerald-950/50 border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Mic Live
          </span>
        ) : (
          <span className="text-slate-400 bg-slate-900/60 border-slate-800">
            Click to Start Speaking
          </span>
        )}
      </div>
    </div>
  );
};
