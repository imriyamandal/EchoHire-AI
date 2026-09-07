import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glow" | "subtle" | "danger" | "success";
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const variantStyles = {
    default: "bg-[#111827]/70 border-slate-800/80 shadow-2xl backdrop-blur-xl",
    glow: "bg-[#111827]/80 border-blue-500/30 shadow-glow-blue backdrop-blur-xl",
    subtle: "bg-slate-900/40 border-slate-800/50 backdrop-blur-md",
    danger: "bg-rose-950/20 border-rose-500/40 shadow-glow-red backdrop-blur-xl",
    success: "bg-emerald-950/20 border-emerald-500/40 backdrop-blur-xl"
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
