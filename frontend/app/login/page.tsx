"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Mic, Lock, Mail, ArrowRight, Sparkles, 
  AlertCircle, Eye, EyeOff, ShieldCheck, CheckSquare, Square 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.user && !res.user.is_onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(res.error || "Invalid email or password");
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@echohire.ai");
    setPassword("EchoHire2026!");
    setError(null);
    setIsSubmitting(true);

    const res = await login("demo@echohire.ai", "EchoHire2026!");
    setIsSubmitting(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Demo login failed. Make sure backend is running.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0B1120] to-[#111827] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[90px] pointer-events-none"
      />

      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[460px] relative z-10 p-7 sm:p-9 rounded-[28px] bg-[#090F1E]/85 border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(37,99,235,0.18)] backdrop-blur-2xl space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-blue group-hover:scale-105 transition-transform duration-300">
              <Mic className="w-6 h-6" />
            </div>
          </Link>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[11px] font-semibold mb-2 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Full-Duplex Voice AI</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              Sign in to resume your personalized voice interview sessions.
            </p>
          </div>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-500/30 flex items-center justify-between gap-3">
          <div className="text-left">
            <div className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Demo Mode</span>
            </div>
            <div className="text-[11px] text-slate-400">Pre-seeded evaluation account</div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            ⚡ 1-Click Demo
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 shadow-md"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer select-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Remember me</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("demo@echohire.ai");
                setPassword("EchoHire2026!");
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Fill demo credentials
            </button>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <AnimatedButton
              size="lg"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full py-3"
              glow
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </AnimatedButton>
          </div>
        </form>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure session token persisted locally</span>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-white/[0.06] text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link href="/signup" className="text-blue-400 hover:text-cyan-300 font-semibold transition-colors">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
