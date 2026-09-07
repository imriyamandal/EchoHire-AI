"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "cyan" | "purple";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "primary",
  size = "md",
  glow = false,
  icon,
  children,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base font-semibold rounded-2xl gap-2.5",
    xl: "px-9 py-4 text-lg font-bold rounded-2xl gap-3"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 border border-blue-400/30",
    secondary: "bg-slate-800/80 text-slate-100 hover:bg-slate-700/80 border border-slate-700/60 shadow-md",
    danger: "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/25 border border-rose-400/30",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent",
    cyan: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 border border-cyan-400/30",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 border border-purple-400/30",
  };

  const glowStyle = glow ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#0B1120] animate-pulse" : "";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
        sizeStyles[size],
        variantStyles[variant],
        glowStyle,
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
