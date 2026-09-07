"use client";

import React from "react";
import Link from "next/link";
import { Mic, Sparkles, LayoutDashboard, User, LogIn } from "lucide-react";
import { AnimatedButton } from "./AnimatedButton";
import { useAuth } from "@/hooks/useAuth";

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#070D1B]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-blue group-hover:scale-105 transition-transform duration-200">
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black font-display tracking-tight text-white flex items-center gap-1">
              EchoHire <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-mono">Listens Like a Human</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/#interruption-demo" className="hover:text-white transition-colors">
            Why Voice Matters
          </Link>
          <Link href="/#personas" className="hover:text-white transition-colors">
            Interviewer Personas
          </Link>
          <Link href="/#technology" className="hover:text-white transition-colors">
            Rime TTS Architecture
          </Link>
          <Link href="/#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right Nav CTA & Auth State */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:border-blue-500/40 transition-all">
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                <span>Dashboard</span>
              </Link>

              <Link href="/interview">
                <AnimatedButton size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Studio
                </AnimatedButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </Link>

              <Link href="/signup">
                <AnimatedButton size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Get Started
                </AnimatedButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
