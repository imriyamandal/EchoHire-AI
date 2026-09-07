import React from "react";
import Link from "next/link";
import { Mic, Github, Heart, Shield, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#0B1120] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white font-display">EchoHire AI</span>
            <span className="text-xs text-slate-500">• Built for Rime Voice Hackathon</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
            The full-duplex interview coach that immediately stops speaking when interrupted and continues the conversation naturally.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="/interview" className="hover:text-white transition-colors">
            Mock Studio
          </Link>
          <a href="https://rime.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Rime TTS
          </a>
          <a href="https://livekit.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            LiveKit WebRTC
          </a>
          <a href="https://deepgram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Deepgram STT
          </a>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for real conversational AI</span>
        </div>
      </div>
    </footer>
  );
};
