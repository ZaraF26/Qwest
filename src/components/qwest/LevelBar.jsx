import React from "react";
import { calcLevel } from "@/lib/qwest";
import { cn } from "@/lib/utils";

export default function LevelBar({ xp, compact = false }) {
  const lvl = calcLevel(xp || 0);
  const pct = Math.round(lvl.progress * 100);
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-heading font-semibold text-foreground">
          Level {lvl.level}
        </span>
        <span className="text-xs text-muted-foreground font-body">{lvl.title}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden ring-1 ring-border">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-moss to-primary transition-all duration-700")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact && (
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
          <span>{lvl.intoLevel} XP</span>
          <span>{lvl.isMax ? "Max level reached" : `${lvl.needed} XP to next`}</span>
        </div>
      )}
    </div>
  );
}