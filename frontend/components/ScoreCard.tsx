"use client";

import React from "react";
import { ScoringResult } from "@/types";
import { Award, Zap, Activity, MessageSquareQuote, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  scoring: ScoringResult;
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ scoring, className }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoring.overall_score / 100) * circumference;

  const scoreColor = 
    scoring.overall_score >= 85 ? "#10B981" : 
    scoring.overall_score >= 70 ? "#3B82F6" : "#F59E0B";

  const categories = [
    { label: "STAR Structure", score: scoring.star_score, icon: Award, color: "text-amber-400 bg-amber-950/40 border-amber-500/30" },
    { label: "Clarity & Articulation", score: scoring.clarity_score, icon: MessageSquareQuote, color: "text-blue-400 bg-blue-950/40 border-blue-500/30" },
    { label: "Confidence & Tone", score: scoring.confidence_score, icon: Activity, color: "text-purple-400 bg-purple-950/40 border-purple-500/30" },
    { label: "Technical Depth", score: scoring.technical_score, icon: Zap, color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30" },
  ];

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* Top Main Score Ring & Core Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#111827] to-slate-900 border border-slate-800 shadow-2xl">
        {/* SVG Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-display text-white tracking-tight">
              {scoring.overall_score}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score / 100</span>
          </div>
        </div>

        {/* Executive Highlights */}
        <div className="flex flex-col flex-1 space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Performance Assessment</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Candidate scored in the <strong>Top {Math.max(5, 100 - scoring.overall_score)}%</strong> tier with exceptional responsiveness during dynamic follow-up questioning.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300">
              Pace: <strong className="text-emerald-400">{scoring.wpm} WPM</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300">
              Filler Words: <strong className={scoring.filler_word_count > 3 ? "text-amber-400" : "text-emerald-400"}>{scoring.filler_word_count}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300">
              Interruptions: <strong className="text-cyan-400">{scoring.interruption_count}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg border", cat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{cat.label}</h4>
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold font-mono text-white">{cat.score}%</span>
            </div>
          );
        })}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {scoring.strengths.map((st, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas to Refine</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {scoring.weaknesses.map((wk, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-purple-500/20 space-y-2.5">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-purple-400" />
          <span>Actionable Coaching Recommendations</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {scoring.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-purple-400 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
