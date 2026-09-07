"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mic, Zap, Shield, Sparkles, ArrowRight, Play, CheckCircle2, 
  XCircle, Award, Users, Cpu, Volume2, HelpCircle, Radio, Building2, Briefcase 
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedButton } from "@/components/AnimatedButton";
import { VoiceWaveform } from "@/components/VoiceWaveform";
import { PersonaSelector } from "@/components/PersonaSelector";
import { PersonaType } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("google");
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Ambient glowing background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none gradient-radial opacity-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Clean Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* ==================================================== */}
        {/* HERO SECTION */}
        {/* ==================================================== */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-xs font-semibold mb-6 shadow-glow-blue animate-pulse">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Built for Rime Voice Hackathon • Full-Duplex Real-Time AI</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-4xl leading-[1.1]">
            The Interview Coach That{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Listens Like a Human.
            </span>
          </h1>

          {/* Subtitle / Storytelling */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Real human interviewers don't wait for a timer—they respond to interruptions and follow your train of thought. 
            <strong> EchoHire AI immediately stops speaking when interrupted</strong>, adapting dynamically to your voice in real time.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href={user ? "/interview" : "/signup"}>
              <AnimatedButton size="lg" variant="primary" icon={<Sparkles className="w-5 h-5" />} glow>
                {user ? "Enter Interview Studio" : "Start Free Mock Interview"}
              </AnimatedButton>
            </Link>

            <Link href={user ? "/dashboard" : "/login"}>
              <button
                className="px-6 py-3.5 rounded-2xl bg-slate-900/90 text-slate-200 border border-white/[0.08] hover:border-blue-500/50 hover:text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                <span>{user ? "View Candidate Dashboard" : "Sign In to Your Account"}</span>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            </Link>
          </div>

          {/* Hero Interactive Soundwave Teaser Card */}
          <div className="mt-14 w-full max-w-3xl p-6 rounded-3xl bg-[#090F1E]/80 border border-white/[0.08] shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-semibold">Live Full-Duplex Engine</span>
              </div>
              <span className="text-blue-400 font-sans font-semibold">Powered by Rime TTS (Mist) & LiveKit</span>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <VoiceWaveform analyser={null} isActive={true} colorScheme="cyan" height={80} />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-300">
                <span className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.08] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Instant Voice Interruption Handling
                </span>
                <span className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.08] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Context Continuity & Memory
                </span>
                <span className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.08] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  STAR Evaluation & PDF Export
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* THE INTERRUPTION BENCHMARK SECTION (WHY VOICE MATTERS) */}
        {/* ==================================================== */}
        <section id="interruption-demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">
              Core Technical Innovation
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Why EchoHire AI Wins Against Ordinary Voice Bots
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Ordinary voice bots are just chatbots with a "play audio" button. If you interrupt them, they finish their pre-generated speech. EchoHire uses WebAudio cancellation tokens and streaming Rime synthesis to halt in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Old Chatbot + Audio Player Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-950/10 border border-rose-900/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                  <XCircle className="w-5 h-5" />
                  <span>Traditional Voice Bots (Chatbot + Audio)</span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Half-Duplex:</strong> Candidate cannot speak while the AI is talking.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Stale Audio Replay:</strong> Plays out entire pre-buffered audio file even after you interrupt.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Context Amnesia:</strong> Loses conversation context when the topic shifts.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-900/40 text-xs text-rose-400 font-medium">
                Interruption Experience: <strong>Frustrating & Robotic</strong>
              </div>
            </div>

            {/* EchoHire AI Full-Duplex Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0D1628] via-[#090F1E] to-blue-950/40 border border-blue-500/50 shadow-glow-blue flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>EchoHire AI (Full-Duplex + Rime TTS)</span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Instant Audio Abort:</strong> Stops speaker output the millisecond you begin speaking.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Zero Stale Speech:</strong> Purges unplayed chunks and pivots directly to your new thought.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Conversation Continuity:</strong> Retains complete memory across multi-turn technical dialogues.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-500/30 text-xs text-emerald-400 flex items-center justify-between font-medium">
                <span>Interruption Experience: <strong>Natural & Human-Like</strong></span>
                <span className="text-blue-300">Powered by Rime TTS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* INTERVIEW PERSONAS SHOWCASE */}
        {/* ==================================================== */}
        <section id="personas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-3">
              Realistic Interviewer Personas
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Tailored Across Top Industry Standards
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Every persona features a tailored conversational style, targeted questioning rubric, and distinct Rime TTS voice profile.
            </p>
          </div>

          <PersonaSelector
            selectedPersona={selectedPersona}
            onSelect={(p) => setSelectedPersona(p)}
          />

          <div className="mt-10 text-center">
            <Link href={user ? "/interview" : "/signup"}>
              <AnimatedButton variant="cyan" size="md" icon={<Play className="w-4 h-4" />}>
                Launch Mock Session with {selectedPersona.toUpperCase()}
              </AnimatedButton>
            </Link>
          </div>
        </section>

        {/* ==================================================== */}
        {/* TECHNOLOGY STACK */}
        {/* ==================================================== */}
        <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">
              Engineering Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Built with Next-Generation Voice Infrastructure
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Rime TTS Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ultra-low latency expressive vocal synthesis with chunked audio streaming and human-like prosody.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">LiveKit & WebAudio VAD</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-duplex WebRTC and WebSocket channels with client-side Voice Activity Detection for instant aborts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Deepgram STT Nova-2</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fast transcription with interim word streaming, confidence scoring, and filler-word detection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">STAR Scoring Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates Situation, Task, Action, Result, speaking pace (WPM), and outputs an executive PDF report.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* INTERACTIVE FAQ */}
        {/* ==================================================== */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-3">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-extrabold font-display text-white">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
              <h4 className="text-sm font-bold text-white mb-2">What is the winning claim of EchoHire AI?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "EchoHire AI immediately stops speaking when interrupted and continues the updated conversation naturally without replaying stale responses." The system uses sub-50ms WebAudio buffer purges and async task cancellation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
              <h4 className="text-sm font-bold text-white mb-2">How does Rime TTS power EchoHire AI?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rime TTS provides real-time streaming speech synthesis with low Time-to-First-Audio. It powers distinct, expressive voices for each persona (Alex Chen, Marcus Vance, Sarah Lin, Elena Rostova).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
              <h4 className="text-sm font-bold text-white mb-2">Can I personalize the interview for specific companies?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yes! During onboarding, you can select your target company (Google, Amazon, Meta, Microsoft, Apple, OpenAI, Startups), role, experience level, and difficulty. EchoHire AI crafts company-specific rubrics dynamically.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* BOTTOM CTA BAND */}
        {/* ==================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/50 to-purple-950/40 border border-blue-500/30 shadow-glow-blue text-center space-y-6">
            <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Ready to Experience Truly Conversational Voice AI?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Step into the studio, practice real-world system design and behavioral questions, interrupt freely, and get instant executive feedback.
            </p>
            <div className="pt-2">
              <Link href={user ? "/interview" : "/signup"}>
                <AnimatedButton size="lg" variant="primary" icon={<Sparkles className="w-5 h-5" />} glow>
                  Launch Interview Studio Now
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
