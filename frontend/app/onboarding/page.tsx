"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Briefcase, Building2, Award, Globe, 
  Layers, ArrowRight, ArrowLeft, CheckCircle2, Mic, 
  Volume2, Check, Play, Pause, Radio, ShieldCheck, User 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, saveOnboarding } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [name, setName] = useState("");
  
  // Step 1: Career Goals
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");

  // Step 2: Interview Preferences
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  // Step 3: Voice Setup State
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const roles = [
    { title: "AI Engineer", desc: "LLMs, RAG, Fine-tuning & Multi-agent architectures" },
    { title: "Machine Learning Engineer", desc: "Model training, PyTorch, inference pipelines" },
    { title: "Software Engineer", desc: "Full-stack systems, distributed services & algorithms" },
    { title: "Frontend Engineer", desc: "React, Next.js, WebAudio, UI/UX architecture" },
    { title: "Backend Engineer", desc: "Databases, microservices, concurrency & scale" },
    { title: "Product Manager", desc: "Product sense, PRDs, execution & metrics" },
    { title: "Data Scientist", desc: "Statistical modeling, predictive analytics & SQL" },
    { title: "DevOps / Cloud", desc: "Kubernetes, CI/CD, AWS, Terraform & security" },
  ];

  const companies = [
    { name: "Google", color: "from-blue-500 to-indigo-600" },
    { name: "Amazon", color: "from-amber-500 to-orange-600" },
    { name: "OpenAI", color: "from-emerald-500 to-teal-600" },
    { name: "Meta", color: "from-blue-600 to-cyan-600" },
    { name: "Microsoft", color: "from-sky-500 to-blue-700" },
    { name: "Apple", color: "from-purple-500 to-indigo-700" },
    { name: "Netflix", color: "from-rose-600 to-red-600" },
    { name: "YC Startup", color: "from-purple-600 to-pink-600" },
  ];

  const levels = [
    { label: "Entry Level / Fresher", yoe: "0-2 YOE" },
    { label: "Mid-Level", yoe: "3-5 YOE" },
    { label: "Senior", yoe: "6-8 YOE" },
    { label: "Staff / Principal", yoe: "9+ YOE" },
  ];

  const interviewTypes = [
    { label: "Technical & Coding", value: "Technical", desc: "Algorithms, tradeoffs, and system implementation" },
    { label: "System Design & Scaling", value: "System Design", desc: "Distributed architectures, caching & database sharding" },
    { label: "Behavioral & STAR", value: "Behavioral", desc: "Situation, Task, Action, Result & leadership principles" },
    { label: "HR & Culture Fit", value: "HR", desc: "Teamwork, communication, work ethic & alignment" },
  ];

  // Test microphone audio stream
  const handleToggleMicTest = async () => {
    if (isMicTesting) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsMicTesting(false);
      setMicVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicTesting(true);

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Could not access microphone:", err);
      alert("Microphone permission was not granted. Please check your browser settings.");
    }
  };

  // Play voice sample preview
  const handlePlayVoicePreview = async () => {
    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/tts/rime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Hello ${name || "Candidate"}! I am your AI interviewer from ${targetCompany}. I look forward to testing your technical depth and architectural tradeoffs today.`,
          speaker: "mist"
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        previewAudioRef.current = audio;
        audio.onended = () => setIsPlayingPreview(false);
        audio.play();
      } else {
        // Fallback WebSpeech preview
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Hello ${name || "Candidate"}! I am your AI interviewer from ${targetCompany}. I look forward to our session.`);
          utterance.onend = () => setIsPlayingPreview(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlayingPreview(false);
        }
      }
    } catch (err) {
      setIsPlayingPreview(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);

    const res = await saveOnboarding({
      name: name || user?.name || "Candidate",
      target_role: targetRole,
      experience_level: experienceLevel,
      target_company: targetCompany,
      interview_type: interviewType,
      preferred_language: preferredLanguage,
      difficulty: difficulty
    });

    setIsSubmitting(false);

    if (res.success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0B1120] to-[#111827] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 p-6 sm:p-10 rounded-[28px] bg-[#090F1E]/85 border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(37,99,235,0.18)] backdrop-blur-2xl space-y-8">
        {/* Header & Step Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-blue">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-display text-white">
                Personalize Your AI Coach
              </h1>
              <p className="text-xs text-slate-400">
                Step {currentStep} of 3 • Customizing real-time voice interview questions
              </p>
            </div>
          </div>

          {/* Stepper Dots / Bars */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                onClick={() => step < currentStep && setCurrentStep(step)}
                className={`flex items-center justify-center h-8 rounded-full px-3 text-xs font-bold transition-all cursor-pointer ${
                  currentStep === step
                    ? "bg-blue-600 text-white shadow-glow-blue"
                    : step < currentStep
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-900 border border-slate-800 text-slate-500"
                }`}
              >
                {step < currentStep ? <Check className="w-3.5 h-3.5" /> : `Step ${step}`}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Steps with Framer Motion */}
        <AnimatePresence mode="wait">
          {/* STEP 1: CAREER GOALS */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Candidate Preferred Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>How should your interviewer address you?</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Target Role Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Your Target Role</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {roles.map((r) => {
                    const isSelected = targetRole === r.title;
                    return (
                      <div
                        key={r.title}
                        onClick={() => setTargetRole(r.title)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-glow-blue"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{r.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Company Badges */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Target Company Format</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {companies.map((c) => {
                    const isSelected = targetCompany === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setTargetCompany(c.name)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-glow-blue"
                            : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Experience Level</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {levels.map((lvl) => {
                    const isSelected = experienceLevel === lvl.label;
                    return (
                      <button
                        key={lvl.label}
                        type="button"
                        onClick={() => setExperienceLevel(lvl.label)}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/25 border-blue-500 text-white shadow-sm"
                            : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lvl.yoe}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Step CTA */}
              <div className="pt-3 flex justify-end">
                <AnimatedButton
                  size="md"
                  variant="primary"
                  onClick={() => setCurrentStep(2)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Preferences
                </AnimatedButton>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERVIEW PREFERENCES */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Interview Type Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary Interview Focus</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {interviewTypes.map((it) => {
                    const isSelected = interviewType === it.value;
                    return (
                      <div
                        key={it.value}
                        onClick={() => setInterviewType(it.value)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-glow-blue"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{it.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{it.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Interview Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "easy", label: "Easy", desc: "Foundational & guided follow-ups" },
                    { id: "medium", label: "Medium", desc: "Industry standard with deep-dives" },
                    { id: "hard", label: "Hard", desc: "Bar raiser with high-scale edge cases" },
                  ].map((d) => {
                    const isSelected = difficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-600/25 border-blue-500 text-white shadow-sm"
                            : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold capitalize text-white">{d.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Language Format</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "en", label: "English (US)", badge: "Global" },
                    { id: "hi", label: "Hindi (हिंदी)", badge: "Native" },
                    { id: "hinglish", label: "Hinglish", badge: "Conversational" },
                  ].map((lang) => {
                    const isSelected = preferredLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setPreferredLanguage(lang.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/25 border-blue-500 text-white shadow-sm"
                            : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{lang.label}</div>
                        <div className="text-[10px] text-blue-400 font-mono mt-0.5">{lang.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Back / Next CTAs */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <AnimatedButton
                  size="md"
                  variant="primary"
                  onClick={() => setCurrentStep(3)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Voice Setup
                </AnimatedButton>
              </div>
            </motion.div>
          )}

          {/* STEP 3: VOICE SETUP */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Voice Engine Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Voice Architecture</span>
                  <h4 className="text-sm font-bold text-white">Full-Duplex Rime TTS Engine</h4>
                  <p className="text-xs text-slate-300">
                    Natural conversational flow with sub-30ms interruption handling.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-glow-blue shrink-0">
                  <Volume2 className="w-6 h-6" />
                </div>
              </div>

              {/* Two Interactive Cards: Mic Test + Voice Sample */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Test Microphone */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-cyan-400" />
                      <span>Test Microphone</span>
                    </span>
                    {isMicTesting && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Verify browser microphone capture and level sensitivity.
                  </p>

                  {/* Level meter bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-75"
                      style={{ width: `${isMicTesting ? micVolume : 0}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleMicTest}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isMicTesting
                        ? "bg-rose-900/60 border border-rose-500/50 text-rose-200 hover:bg-rose-900"
                        : "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isMicTesting ? "Stop Mic Test" : "Check Microphone"}</span>
                  </button>
                </div>

                {/* 2. Voice Preview */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span>Interviewer Voice</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                      Rime AI
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Preview {targetCompany}'s custom synthetic voice style.
                  </p>

                  <div className="h-2.5 flex items-center gap-1">
                    {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 bg-purple-500/80 rounded-full transition-all duration-200 ${
                          isPlayingPreview ? "animate-pulse" : "opacity-30"
                        }`}
                        style={{ height: isPlayingPreview ? `${h}%` : "30%" }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayVoicePreview}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isPlayingPreview
                        ? "bg-purple-900/60 border border-purple-500/50 text-purple-200"
                        : "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingPreview ? "Playing Sample..." : "Listen to Voice"}</span>
                  </button>
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Profile Configured:</span>
                </div>
                <p className="text-slate-400 pl-6">
                  Candidate: <strong>{name || "Candidate"}</strong> • Target: <strong>{targetRole}</strong> at <strong>{targetCompany}</strong> • Focus: <strong>{interviewType}</strong> ({difficulty.toUpperCase()})
                </p>
              </div>

              {/* Back / Finish CTAs */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <AnimatedButton
                  size="lg"
                  variant="primary"
                  onClick={handleFinishOnboarding}
                  disabled={isSubmitting}
                  icon={<Sparkles className="w-4 h-4" />}
                  glow
                >
                  {isSubmitting ? "Launching Studio..." : "Save Preferences & Enter Dashboard"}
                </AnimatedButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
