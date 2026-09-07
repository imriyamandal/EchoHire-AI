"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Mic, Clock, CheckCircle2, Sparkles, Building2, 
  Briefcase, ShieldCheck, Volume2, Globe, Layers, Award, Loader2 
} from "lucide-react";
import { InterviewSidebar } from "@/components/InterviewSidebar";
import { InterviewAnalyticsPanel } from "@/components/InterviewAnalyticsPanel";
import { VoiceOrb } from "@/components/VoiceOrb";
import { DynamicNeonWaveform } from "@/components/DynamicNeonWaveform";
import { LiveConversationStream } from "@/components/LiveConversationStream";
import { FloatingControlBar } from "@/components/FloatingControlBar";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { useAuth } from "@/hooks/useAuth";
import { PersonaType, DifficultyType, LanguageType } from "@/types";
import { formatTime, cn } from "@/lib/utils";

export default function InterviewPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Authentication & Onboarding Protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && !user.is_onboarded) {
      router.push("/onboarding");
    }
  }, [user, isLoading, router]);

  const candidateName = user?.name || "Candidate";
  const targetRole = user?.target_role || "Software Engineer";
  const targetCompany = user?.target_company || "Google";
  const interviewType = user?.interview_type || "Technical";
  const difficulty = (user?.difficulty?.toLowerCase() as DifficultyType) || "medium";
  const experienceLevel = user?.experience_level || "Mid-Level";
  const preferredLanguage = (user?.preferred_language as LanguageType) || "en";

  // Voice Session Controller with user profile customization
  const {
    isConnected,
    isMicActive,
    isAiSpeaking,
    isUserSpeaking,
    isInterrupted,
    persona,
    language,
    messages,
    currentAiText,
    currentUserText,
    scoring,
    analyser,
    connect,
    toggleMicrophone,
    triggerInterruption,
    sendTextMessage,
    setLanguage,
    endSession
  } = useVoiceSession({
    initialPersona: (targetCompany.toLowerCase() as PersonaType) || "google",
    initialDifficulty: difficulty,
    initialLanguage: preferredLanguage,
    candidateName: candidateName,
    targetRole: targetRole,
    targetCompany: targetCompany,
    interviewType: interviewType,
    experienceLevel: experienceLevel
  });

  // Connect on mount when authenticated
  useEffect(() => {
    if (user && user.is_onboarded) {
      connect();
    }
  }, [user, connect]);

  // Session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When scoring arrives, save to sessionStorage and redirect to /summary
  useEffect(() => {
    if (scoring) {
      sessionStorage.setItem("echohire_scoring", JSON.stringify(scoring));
      sessionStorage.setItem("echohire_transcript", JSON.stringify(messages));
      sessionStorage.setItem("echohire_duration", formatTime(sessionSeconds));
      sessionStorage.setItem("echohire_persona", persona);
      sessionStorage.setItem("echohire_candidate_name", candidateName);
      sessionStorage.setItem("echohire_target_role", targetRole);
      sessionStorage.setItem("echohire_target_company", targetCompany);
      router.push("/summary");
    }
  }, [scoring, messages, sessionSeconds, persona, candidateName, targetRole, targetCompany, router]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold">Preparing Your Interview Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-row overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] pointer-events-none gradient-radial opacity-40 z-0" />

      {/* ==================================================== */}
      {/* 1. LEFT SIDEBAR                                     */}
      {/* ==================================================== */}
      <InterviewSidebar />

      {/* ==================================================== */}
      {/* 2. CENTER WORKSPACE (Voice Centerpiece)              */}
      {/* ==================================================== */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 z-10 max-w-5xl mx-auto">
        {/* TOP GREETING & PERSONALIZED GOAL BANNER */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0D1527]/90 via-[#0B1120]/70 to-[#0D1527]/90 border border-white/[0.08] shadow-glass-card backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                {getGreeting()}, {candidateName} 👋
              </h1>
              
              {/* Target Role & Target Company Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  {targetCompany}
                </span>

                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/[0.08] text-slate-300 text-xs font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {targetRole}
                </span>

                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-white/[0.08] text-slate-400 text-xs font-medium capitalize">
                  {difficulty} Difficulty
                </span>

                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-white/[0.08] text-slate-400 text-xs font-medium">
                  {experienceLevel}
                </span>
              </div>
            </div>

            {/* Fixed AI Interviewer Avatar Card */}
            <div className="flex items-center gap-3.5 p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/80 border border-white/[0.08] shadow-sm shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-glow-purple">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Interviewer</span>
                <h4 className="text-xs font-bold text-white">{targetCompany} AI Panelist</h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Rime Voice Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE VOICE INTERVIEW STUDIO (The Centerpiece) */}
        <div className="relative flex-1 flex flex-col p-6 sm:p-8 rounded-3xl bg-[#090F1E]/85 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Card Header with Time and Status */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white font-display">Live Voice Session</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Full-Duplex Connected
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatTime(sessionSeconds)}</span>
              </div>
            </div>
          </div>

          {/* GIANT VOICE ORB (Centerpiece) */}
          <div className="flex flex-col items-center justify-center">
            <VoiceOrb
              isMicActive={isMicActive}
              isAiSpeaking={isAiSpeaking}
              isUserSpeaking={isUserSpeaking}
              isInterrupted={isInterrupted}
              onToggleMic={toggleMicrophone}
            />
          </div>

          {/* DYNAMIC NEON WAVEFORM */}
          <DynamicNeonWaveform
            analyser={analyser}
            isActive={isAiSpeaking || isUserSpeaking}
            isUserSpeaking={isUserSpeaking}
            height={64}
          />

          {/* LIVE CONVERSATION STREAM */}
          <div className="flex-1 min-h-[220px] max-h-[360px] flex flex-col pt-2">
            <LiveConversationStream
              messages={messages}
              currentAiText={currentAiText}
              currentUserText={currentUserText}
              persona={persona}
              isAiSpeaking={isAiSpeaking}
              className="flex-1"
            />
          </div>

          {/* FLOATING GLASS BOTTOM CONTROL BAR */}
          <div className="pt-2 sticky bottom-0 z-20">
            <FloatingControlBar
              isMicActive={isMicActive}
              isAiSpeaking={isAiSpeaking}
              isUserSpeaking={isUserSpeaking}
              language={language}
              onToggleMic={toggleMicrophone}
              onInterrupt={triggerInterruption}
              onSendText={sendTextMessage}
              onLanguageChange={setLanguage}
              onEndSession={endSession}
            />
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* 3. RIGHT SESSION PROGRESS CARD                       */}
      {/* ==================================================== */}
      <InterviewAnalyticsPanel
        isAiSpeaking={isAiSpeaking}
        isUserSpeaking={isUserSpeaking}
        isMicActive={isMicActive}
        sessionSeconds={sessionSeconds}
        targetRole={targetRole}
        targetCompany={targetCompany}
        interviewType={interviewType}
        difficulty={difficulty}
        totalMessages={messages.length}
      />
    </div>
  );
}
