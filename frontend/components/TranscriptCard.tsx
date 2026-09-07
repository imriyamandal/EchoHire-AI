"use client";

import React, { useEffect, useRef } from "react";
import { Message, PersonaType } from "@/types";
import { Bot, User, Zap, Sparkles } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface TranscriptCardProps {
  messages: Message[];
  currentAiText?: string;
  currentUserText?: string;
  persona: PersonaType;
  className?: string;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  messages,
  currentAiText,
  currentUserText,
  persona,
  className
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAiText, currentUserText]);

  return (
    <div className={cn("flex flex-col h-full overflow-y-auto space-y-4 p-4 pr-2 custom-scrollbar", className)}>
      {messages.length === 0 && !currentAiText && !currentUserText && (
        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
          <Sparkles className="w-8 h-8 mb-2 text-blue-400/60 animate-pulse" />
          <p className="text-sm">Connecting to interview session...</p>
          <span className="text-xs text-slate-600 mt-1">Speak into the microphone anytime to answer or interrupt.</span>
        </div>
      )}

      {messages.map((msg) => {
        const isAssistant = msg.role === "assistant";
        return (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[88%] transition-all duration-300",
              isAssistant ? "self-start items-start" : "self-end items-end"
            )}
          >
            {/* Header / Badges */}
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-400">
              {isAssistant ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300 font-semibold">{msg.speakerName || "Interviewer"}</span>
                  {msg.was_pivot && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-400 border border-amber-500/30 text-[10px]">
                      <Zap className="w-2.5 h-2.5" /> Interruption Pivot
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-slate-300 font-semibold">You (Candidate)</span>
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                </>
              )}
              <span className="text-slate-600 ml-1 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Bubble Content */}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm",
                isAssistant
                  ? "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-sm"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm border border-blue-400/20"
              )}
            >
              {msg.content}
            </div>
          </div>
        );
      })}

      {/* Interim User Live Stream (Word-by-word streaming) */}
      {currentUserText && (
        <div className="flex flex-col max-w-[88%] self-end items-end animate-pulse">
          <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-cyan-400 font-medium">
            <span>Speaking...</span>
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 rounded-tr-sm">
            {currentUserText}
            <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
