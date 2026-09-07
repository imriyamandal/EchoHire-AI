"use client";

import React, { useRef } from "react";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  colorScheme?: "blue" | "purple" | "cyan" | "emerald";
  className?: string;
  height?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  analyser,
  isActive,
  colorScheme = "blue",
  className,
  height = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAudioVisualizer(analyser, canvasRef, isActive, colorScheme);

  return (
    <div className={cn("relative w-full flex items-center justify-center overflow-hidden rounded-xl", className)}>
      <canvas
        ref={canvasRef}
        width={480}
        height={height}
        className="w-full h-full block"
      />
      {/* Subtle outer glow layer */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-500",
          isActive ? "opacity-30 blur-md" : "opacity-0",
          colorScheme === "blue" && "bg-blue-500/20",
          colorScheme === "purple" && "bg-purple-500/20",
          colorScheme === "cyan" && "bg-cyan-500/20",
          colorScheme === "emerald" && "bg-emerald-500/20"
        )}
      />
    </div>
  );
};
