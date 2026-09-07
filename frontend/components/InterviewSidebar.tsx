"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Mic, LayoutDashboard, History, FileBarChart2, 
  Settings, Sparkles, LogOut, UserCircle, Briefcase, Building2 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface InterviewSidebarProps {
  className?: string;
}

export const InterviewSidebar: React.FC<InterviewSidebarProps> = ({
  className
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" || pathname === "/" },
    { label: "Live Interview", icon: Mic, href: "/interview", active: pathname === "/interview" },
    { label: "Session Report", icon: FileBarChart2, href: "/summary", active: pathname === "/summary" },
    { label: "Goal Settings", icon: Settings, href: "/onboarding", active: pathname === "/onboarding" },
  ];

  const candidateName = user?.name || "Candidate";
  const targetRole = user?.target_role || "Software Engineer";
  const targetCompany = user?.target_company || "Google";

  return (
    <aside
      className={cn(
        "w-60 shrink-0 h-screen sticky top-0 hidden lg:flex flex-col justify-between p-4 border-r border-white/[0.06] bg-[#070D1B]/90 backdrop-blur-2xl text-slate-300 select-none z-20",
        className
      )}
    >
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-blue group-hover:scale-105 transition-all duration-300">
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold font-display tracking-tight text-white flex items-center gap-1">
              EchoHire <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-0.5">Voice Interview Coach</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer",
                  item.active
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    item.active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span>{item.label}</span>
                </div>
                {item.active && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-cyan animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Authenticated User Badge & Logout */}
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        {/* User Card */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-white truncate">{candidateName}</h5>
              <p className="text-[10px] text-slate-400 truncate">{targetCompany} • {targetRole}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
