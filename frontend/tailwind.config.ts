import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#030712",
        surface: "#0B1120",
        "surface-card": "rgba(11, 17, 32, 0.8)",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#2563EB",
          glow: "#3B82F6",
          dark: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#7C3AED",
          glow: "#8B5CF6",
          dark: "#6D28D9",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          glow: "#22D3EE",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F43F5E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 2s infinite",
        "wave": "wave 1.2s ease-in-out infinite",
        "orb-breath": "orbBreath 4s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "ripple-1": "rippleExpand 3s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "ripple-2": "rippleExpand 3s cubic-bezier(0, 0.2, 0.8, 1) infinite 1s",
        "ripple-3": "rippleExpand 3s cubic-bezier(0, 0.2, 0.8, 1) infinite 2s",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.06)" },
        },
        orbBreath: {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 25px rgba(37,99,235,0.4))" },
          "50%": { transform: "scale(1.04)", filter: "drop-shadow(0 0 45px rgba(124,58,237,0.65))" },
        },
        rippleExpand: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wave: {
          "0%, 100%": { height: "8px" },
          "50%": { height: "32px" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 35px -5px rgba(37, 99, 235, 0.5)",
        "glow-purple": "0 0 40px -5px rgba(124, 58, 237, 0.55)",
        "glow-cyan": "0 0 35px -5px rgba(6, 182, 212, 0.5)",
        "glow-orb": "0 0 60px 10px rgba(59, 130, 246, 0.35)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glass-lg": "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "24px",
      }
    },
  },
  plugins: [],
};

export default config;
