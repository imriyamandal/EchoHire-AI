"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DynamicNeonWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  isUserSpeaking?: boolean;
  className?: string;
  height?: number;
}

export const DynamicNeonWaveform: React.FC<DynamicNeonWaveformProps> = ({
  analyser,
  isActive,
  isUserSpeaking = false,
  className,
  height = 70
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isActive) {
        bufferLength = analyser.frequencyBinCount;
        if (dataArray.length !== bufferLength) {
          dataArray = new Uint8Array(bufferLength);
        }
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle organic ambient wave
        const time = Date.now() * 0.0025;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = isActive
            ? Math.floor(45 + 35 * Math.sin(time + i * 0.22))
            : Math.floor(12 + 10 * Math.sin(time + i * 0.15));
        }
      }

      const barWidth = (width / bufferLength) * 1.8;
      let x = 0;

      // Neon Gradient: Cyan to Purple to Indigo
      const grad = ctx.createLinearGradient(0, height, 0, 0);
      if (isUserSpeaking) {
        grad.addColorStop(0, "rgba(6, 182, 212, 0.2)");
        grad.addColorStop(0.5, "rgba(34, 211, 238, 0.9)");
        grad.addColorStop(1, "rgba(59, 130, 246, 1)");
      } else {
        grad.addColorStop(0, "rgba(124, 58, 237, 0.2)");
        grad.addColorStop(0.5, "rgba(139, 92, 246, 0.9)");
        grad.addColorStop(1, "rgba(6, 182, 212, 1)");
      }

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * height * 0.9);
        const yTop = (height - barHeight) / 2;

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, yTop, Math.max(2.5, barWidth - 2.5), barHeight, [3, 3, 3, 3]);
        ctx.fill();

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, isUserSpeaking]);

  return (
    <div className={cn("relative w-full overflow-hidden flex items-center justify-center rounded-2xl bg-black/20 border border-white/[0.04] p-2", className)}>
      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full h-full block"
      />
      {/* Background glow strip */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-500 blur-xl",
        isActive ? "opacity-25" : "opacity-0",
        isUserSpeaking ? "bg-cyan-500/20" : "bg-purple-500/20"
      )} />
    </div>
  );
};
