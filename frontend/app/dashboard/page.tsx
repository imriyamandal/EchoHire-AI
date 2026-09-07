"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mic, Sparkles, Award, TrendingUp, CheckCircle2, 
  AlertTriangle, Clock, Play, ArrowRight, RotateCcw, 
  Building2, Briefcase, ChevronRight, UserCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { InterviewSidebar } from "@/components/InterviewSidebar";
import { AnimatedButton } from "@/components/AnimatedButton";
import { SessionHistoryItem } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    if (!isLoading && !user && !token) {
      router.push("/login");
      return;
    }
    if (user && !user.is_onboarded) {
      router.push("/onboarding");
      return;
    }

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          if (data.recent_sessions) {
            setSessions(data.recent_sessions);
          }
          setIsDataLoading(false);
        })
        .catch((err) => {
          console.warn("Could not load stats:", err);
          setIsDataLoading(false);
        });
    }
  }, [user, token, isLoading, router]);

  const candidateName = user?.name || "Candidate";
  const targetRole = user?.target_role || "Software Engineer";
  const targetCompany = user?.target_company || "Google";
  const experienceLevel = user?.experience_level || "Mid-Level";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-row selection:bg-blue-600 selection:text-white">
      {/* Persistent Left Navigation Sidebar */}
      <InterviewSidebar />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto z-10">
        {/* Top Header Card: Personalized Greeting */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0D1527]/95 via-[#0B1120]/80 to-[#0D1527]/95 border border-white/[0.08] shadow-glass-card backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>EchoHire AI Voice Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              {getGreeting()}, {candidateName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Preparing for your <strong>{targetRole}</strong> interview at <strong>{targetCompany}</strong>. Practice full-duplex conversations and receive immediate executive feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link href="/onboarding">
              <button className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer">
                Edit Goal Profile
              </button>
            </Link>
            <Link href="/interview">
              <AnimatedButton size="md" variant="primary" icon={<Play className="w-4 h-4" />} glow>
                Start Mock Interview
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Sessions */}
          <div className="p-5 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Total Interviews</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {stats?.total_interviews || sessions.length || 1}
              </div>
              <span className="text-[10px] text-slate-500">Completed full-duplex rounds</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mic className="w-6 h-6" />
            </div>
          </div>

          {/* Average Score */}
          <div className="p-5 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Average Performance</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                {stats?.avg_score || 88}%
              </div>
              <span className="text-[10px] text-emerald-500">High Tier Readiness</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Target Goal */}
          <div className="p-5 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Target Match</span>
              <div className="text-base sm:text-lg font-bold text-cyan-300 truncate max-w-[150px]">
                {targetCompany}
              </div>
              <span className="text-[10px] text-slate-400 truncate block">{targetRole}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-6 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Core Strengths Identified</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {(stats?.top_strengths || [
                `Clear architectural articulation aligned with ${targetCompany} standards.`,
                "Strong vocal cadence at optimal pace without rushing.",
                "Fast conversational agility during follow-up questions."
              ]).map((st: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus Areas */}
          <div className="p-6 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Recommended Focus Areas</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {(stats?.top_weaknesses || [
                "Quantify results in the STAR framework with concrete business metrics.",
                "Pause for 1 second before answering complex technical tradeoffs."
              ]).map((wk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Sessions List */}
        <div className="p-6 rounded-2xl bg-[#090F1E]/80 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Interview Sessions
            </h3>
            <Link href="/interview" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
              <span>New Session</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-slate-400">No previous sessions yet. Ready to start your first mock round?</p>
              <Link href="/interview">
                <AnimatedButton size="sm" variant="primary">
                  Start Your First Interview
                </AnimatedButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between gap-4 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{sess.target_company} • {sess.target_role}</h4>
                      <p className="text-[11px] text-slate-400">{sess.interview_type} • {sess.difficulty.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Score: 88%
                    </span>
                    <Link href="/summary">
                      <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer">
                        View Report
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
