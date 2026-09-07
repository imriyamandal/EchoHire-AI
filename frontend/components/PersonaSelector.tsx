"use client";

import React from "react";
import { PersonaType } from "@/types";
import { PERSONA_DATA, cn } from "@/lib/utils";
import { Cpu, ShoppingBag, Rocket, HeartHandshake, Check } from "lucide-react";

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
  disabled?: boolean;
  className?: string;
}

const personaIcons = {
  google: Cpu,
  amazon: ShoppingBag,
  startup: Rocket,
  hr: HeartHandshake,
};

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelect,
  disabled = false,
  className
}) => {
  const personas: (keyof typeof PERSONA_DATA)[] = ["google", "amazon", "startup", "hr"];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {personas.map((pKey) => {
        const data = PERSONA_DATA[pKey];
        const Icon = personaIcons[pKey];
        const isSelected = selectedPersona === pKey;

        return (
          <button
            key={pKey}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(pKey)}
            className={cn(
              "relative flex flex-col p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer select-none",
              isSelected
                ? "bg-slate-900 border-blue-500/80 shadow-glow-blue ring-1 ring-blue-500/50"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
            )}
          >
            {/* Active Checkmark Pill */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-tr text-white shadow-sm", data.avatarBg)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{data.name}</h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{data.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {data.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Voice: <strong className="text-blue-400 capitalize">{data.voice} (Rime)</strong></span>
              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", data.badgeColor)}>
                {pKey.toUpperCase()}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
