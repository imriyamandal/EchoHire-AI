"use client";

import React from "react";
import { 
  Clock, CheckCircle2, Circle, Radio, Volume2, 
  Sparkles, ShieldCheck, Target, Building2, Briefcase, Award 
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface InterviewAnalyticsPanelProps {
  isAiSpeaking?: boolean;
  isUserSpeaking?: boolean;
  isMicActive?: boolean;
  sessionSeconds: number;
  targetRole?: string;
  targetCompany?: string;
  interviewType?: string;
  difficulty?: string;
  totalMessages?: number;
  className?: string;
}

export const InterviewAnalyticsPanel: React.FC<InterviewAnalyticsPanelProps> = ({
  isAiSpeaking = false,
  isUserSpeaking = false,
  isMicActive = false,
  sessionSeconds,
  targetRole = "Software Engineer",
  targetCompany = "Google",
  interviewType = "Technical",
  difficulty = "Medium",
  totalMessages = 0,
  className
}) => {
  // Target duration: 8 minutes (480s)
  const targetDurationSeconds = 480;
  const progressPercent = Math.min(100, Math.round((sessionSeconds / targetDurationSeconds) * 100));

  // Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Interview stage milestones based on conversation turns
  const stages = [
    { id: 1, title: "Candidate Introduction", minMsg: 1 },
    { id: 2, title: "Technical Problem Formulation", minMsg: 3 },
    { id: 3, title: "Architecture & Edge Cases", minMsg: 7 },
    { id: 4, title: "Behavioral & STAR Alignment", minMsg: 11 },
    { id: 5, title: "Final Evaluation & Feedback", minMsg: 15 }
  ];

  const currentStageIndex = stages.reduce((acc, stage, idx) => {
    return totalMessages >= stage.minMsg ? idx : acc;
  }, 0);

  return (
    <aside
      className={cn(
        "w-80 shrink-0 h-screen sticky top-0 hidden xl:flex flex-col space-y-6 p-5 border-l border-white/[0.06] bg-[#070D1B]/85 backdrop-blur-2xl text-slate-200 overflow-y-auto custom-scrollbar select-none z-20",
        className
      )}
    >
      {/* 1. TOP TARGET FOCUS CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0E1628]/95 via-[#0B1120]/80 to-[#0E1628]/95 border border-white/[0.08] shadow-glass-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Target Session</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30">
            {difficulty}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>{targetCompany}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>{targetRole}</span>
          </p>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span>Type: <strong className="text-slate-200">{interviewType}</strong></span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Human-Like AI
          </span>
        </div>
      </div>

      {/* 2. CIRCULAR SESSION PROGRESS CARD */}
      <div className="p-5 rounded-2xl bg-[#0B1120]/90 border border-white/[0.08] shadow-glass-card space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Session Progress</span>
          <div className="flex items-center gap-1 font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTime(sessionSeconds)}</span>
          </div>
        </div>

        {/* Big Circular Ring */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#progressGrad)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                fill="transparent"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold font-mono text-white">{progressPercent}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Pace</span>
            </div>
          </div>
        </div>

        {/* Live Speaking Status Pill */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Live Status</div>
          {isUserSpeaking ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-glow-cyan animate-pulse">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Listening to Candidate...</span>
            </div>
          ) : isAiSpeaking ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-glow-purple">
              <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>AI Interviewer Speaking</span>
            </div>
          ) : isMicActive ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Microphone Active • Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>Microphone Muted</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. INTERVIEW ROADMAP STAGES */}
      <div className="p-5 rounded-2xl bg-[#0B1120]/90 border border-white/[0.08] shadow-glass-card space-y-3.5 flex-1">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span>Interview Structure</span>
          <span className="text-[10px] text-blue-400 font-mono">Stage {currentStageIndex + 1}/5</span>
        </div>

        <div className="space-y-3 pt-1">
          {stages.map((stage, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stage.id} className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs font-medium truncate",
                    isCurrent ? "text-white font-bold" : isPassed ? "text-slate-400" : "text-slate-600"
                  )}>
                    {stage.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful Tip */}
        <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed">
          <p className="flex items-center gap-1 font-bold text-blue-400 mb-0.5">
            <Sparkles className="w-3 h-3" /> Voice Coach Tip
          </p>
          Speak at a natural pace. Feel free to interrupt the AI whenever you need to clarify assumptions or pivot.
        </div>
      </div>
    </aside>
  );
};
