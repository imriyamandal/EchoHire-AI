import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const PERSONA_DATA = {
  google: {
    name: "Alex Chen",
    role: "Staff Engineer @ Google",
    voice: "allison",
    description: "Deep dive into system design, algorithmic edge cases, and high-scale concurrency tradeoffs.",
    avatarBg: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  amazon: {
    name: "Marcus Vance",
    role: "Principal Bar Raiser @ Amazon",
    voice: "amber",
    description: "Strict STAR methodology. Demands quantitative metrics, Customer Obsession, and high ownership.",
    avatarBg: "from-amber-600 to-orange-600",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  startup: {
    name: "Sarah Lin",
    role: "Founding CTO @ YC Startup",
    voice: "creek",
    description: "Fast-paced, pragmatic problem solving, rapid 0-to-1 prototyping, and extreme agency.",
    avatarBg: "from-purple-600 to-pink-600",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  hr: {
    name: "Elena Rostova",
    role: "Head of People & Culture",
    voice: "marsh",
    description: "Emotional intelligence, team conflict resolution, cross-functional collaboration, and cultural alignment.",
    avatarBg: "from-emerald-600 to-teal-600",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  }
};
