"use client";

import React, { useState } from "react";
import { 
  Mic, MicOff, Globe, Zap, Send, CheckCircle2, 
  MessageSquare, Keyboard, Volume2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageType } from "@/types";

interface FloatingControlBarProps {
  isMicActive: boolean;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  language: LanguageType;
  onToggleMic: () => void;
  onInterrupt: () => void;
  onSendText: (text: string) => void;
  onLanguageChange: (lang: LanguageType) => void;
  onEndSession: () => void;
  className?: string;
}

export const FloatingControlBar: React.FC<FloatingControlBarProps> = ({
  isMicActive,
  isAiSpeaking,
  isUserSpeaking,
  language,
  onToggleMic,
  onInterrupt,
  onSendText,
  onLanguageChange,
  onEndSession,
  className
}) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedText, setTypedText] = useState("");

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    onSendText(typedText);
    setTypedText("");
    setShowTextInput(false);
  };

  return (
    <div className={cn("w-full flex flex-col items-center gap-3 select-none", className)}>
      {/* Optional Pop-up Text Input Form */}
      {showTextInput && (
        <form
          onSubmit={handleTextSubmit}
          className="w-full max-w-xl flex items-center gap-2 p-2 rounded-2xl bg-[#0F172A]/90 border border-blue-500/40 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your answer or interrupt here..."
            autoFocus
            className="flex-1 px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Main Floating Glass Island */}
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-5 py-3 rounded-full bg-[#0B1120]/85 border border-white/[0.1] shadow-2xl backdrop-blur-2xl text-slate-300">
        {/* Language Switcher Dropdown */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageType)}
            className="bg-transparent text-xs font-semibold text-slate-200 hover:text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="en" className="bg-slate-900 text-slate-200">EN (English)</option>
            <option value="hi" className="bg-slate-900 text-slate-200">HI (हिंदी)</option>
            <option value="hinglish" className="bg-slate-900 text-slate-200">Hinglish</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-white/[0.1] hidden sm:block" />

        {/* Quick Interrupt Button */}
        <button
          onClick={onInterrupt}
          type="button"
          title="Interrupt AI Mid-sentence"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500/50 text-xs font-medium text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Interrupt</span>
        </button>

        {/* Central Giant Glowing Microphone Trigger */}
        <button
          onClick={onToggleMic}
          type="button"
          aria-label={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
          className={cn(
            "relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 shadow-xl",
            isMicActive
              ? isUserSpeaking
                ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-glow-cyan ring-4 ring-cyan-500/40 scale-105"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-glow-blue ring-4 ring-blue-500/30"
              : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
          )}
        >
          {isMicActive ? (
            <Mic className="w-6 h-6 animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>

        {/* Toggle Keyboard / Text Input */}
        <button
          onClick={() => setShowTextInput((prev) => !prev)}
          type="button"
          title="Toggle Text Input"
          className={cn(
            "p-2 rounded-full border transition-all cursor-pointer",
            showTextInput
              ? "bg-blue-600/30 border-blue-500 text-blue-300"
              : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
          )}
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-white/[0.1] hidden sm:block" />

        {/* End & Review CTA */}
        <button
          onClick={onEndSession}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>End & Review</span>
        </button>
      </div>
    </div>
  );
};
