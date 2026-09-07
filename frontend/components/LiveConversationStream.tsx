"use client";

import React, { useEffect, useRef } from "react";
import { Message, PersonaType } from "@/types";
import { Bot, User, Volume2, Zap, Sparkles } from "lucide-react";
import { cn, PERSONA_DATA } from "@/lib/utils";

interface LiveConversationStreamProps {
  messages: Message[];
  currentAiText?: string;
  currentUserText?: string;
  persona: PersonaType;
  isAiSpeaking?: boolean;
  className?: string;
}

export const LiveConversationStream: React.FC<LiveConversationStreamProps> = ({
  messages,
  currentAiText,
  currentUserText,
  persona,
  isAiSpeaking = false,
  className
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentPersona = PERSONA_DATA[persona as keyof typeof PERSONA_DATA] || PERSONA_DATA.google;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAiText, currentUserText]);

  return (
    <div className={cn("flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar", className)}>
      {/* Empty / Intro Prompt */}
      {messages.length === 0 && !currentAiText && !currentUserText && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-glow-blue animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Connecting with {currentPersona.name}...</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            The interview starts automatically. Speak naturally or jump in to interrupt whenever you want.
          </p>
        </div>
      )}

      {/* Message Bubbles */}
      {messages.map((msg, index) => {
        const isAssistant = msg.role === "assistant";
        return (
          <div
            key={msg.id || index}
            className={cn(
              "flex flex-col max-w-[85%] transition-all duration-300",
              isAssistant ? "self-start items-start" : "self-end items-end"
            )}
          >
            {/* Header / Avatar & Role Tag */}
            <div className="flex items-center gap-2 mb-1.5 px-1 text-xs font-medium">
              {isAssistant ? (
                <>
                  <div className="w-5 h-5 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 font-bold text-xs">{msg.speakerName || currentPersona.name}</span>
                  {msg.was_pivot && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-semibold animate-fade-in">
                      <Zap className="w-2.5 h-2.5" /> Interrupted & Pivoted
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-slate-200 font-bold text-xs">You</span>
                  <div className="w-5 h-5 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-sm">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
              <span className="text-slate-500 text-[10px] font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Bubble Container */}
            <div
              className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-xl transition-all",
                isAssistant
                  ? "bg-[#111827]/90 border border-white/[0.08] text-slate-100 rounded-tl-sm hover:border-purple-500/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm border border-blue-400/30 shadow-glow-blue"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Assistant Footer Strip */}
              {isAssistant && (
                <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-purple-300 font-sans">
                    <Volume2 className="w-3 h-3 text-purple-400" /> Spoken via AI Voice
                  </span>
                  <span className="text-[10px] text-slate-500">LiveKit Audio Stream</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Interim User Live Speech Bubble */}
      {currentUserText && (
        <div className="flex flex-col max-w-[85%] self-end items-end animate-pulse">
          <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-cyan-400 font-medium">
            <span>Listening...</span>
            <div className="w-5 h-5 rounded-lg bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="p-4 rounded-2xl text-sm leading-relaxed bg-cyan-950/50 border border-cyan-500/50 text-cyan-100 rounded-tr-sm shadow-glow-cyan">
            {currentUserText}
            <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-400 animate-pulse" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
