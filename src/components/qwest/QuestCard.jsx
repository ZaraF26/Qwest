import React from "react";
import { Clock, Check, Play, Crown } from "lucide-react";
import { CATEGORIES } from "@/lib/qwest";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";

export default function QuestCard({ quest, onComplete, compact = false }) {
  const { timer, start } = useTimer();
  const isMain = quest.type === "main";
  const cat = CATEGORIES.find((c) => c.key === quest.category);
  const isActiveTimer = timer?.questId === quest.id;
  const done = quest.status === "completed";

  const durationLabel = (m) => {
    if (!m) return null;
    if (m >= 120) return "2h+";
    if (m >= 60) return "1h";
    if (m >= 45) return "45m";
    if (m >= 30) return "30m";
    if (m >= 15) return "15m";
    if (m >= 10) return "10m";
    return "5m";
  };

  return (
    <div
      className={cn(
        "parchment-card rounded-2xl border p-4 transition-all",
        isMain ? "border-primary/30" : "border-border",
        done && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                isMain ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground"
              )}
            >
              {isMain ? "Main Quest" : "Side Quest"}
            </span>
            {cat && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <span aria-hidden="true">{cat.emoji}</span>{cat.label}
              </span>
            )}
          </div>
          <h3 className={cn("font-heading text-base text-foreground leading-snug", done && "line-through")}>
            {quest.title}
          </h3>
        </div>
        <button
          onClick={() => onComplete(quest)}
          disabled={done}
          aria-label={done ? "Quest complete" : "Complete quest"}
          className={cn(
            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-2 transition active:scale-90",
            done ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-primary ring-primary/40 hover:bg-primary/10"
          )}
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
          {quest.estimated_minutes ? (
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{durationLabel(quest.estimated_minutes)}</span>
          ) : null}
          {quest.due_time && <span>Due {quest.due_time}</span>}
          <span className="inline-flex items-center gap-1 text-gold"><Crown className="w-3.5 h-3.5" />{quest.xp_value} XP</span>
          {quest.gold_value ? <span className="text-gold">+{quest.gold_value} gold</span> : null}
        </div>
      )}

      {!done && !isActiveTimer && quest.estimated_minutes && !compact && (
        <button
          onClick={() => start(quest, quest.estimated_minutes)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Play className="w-3.5 h-3.5" /> Start hourglass timer
        </button>
      )}
      {!done && isActiveTimer && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Timer running…
        </div>
      )}
    </div>
  );
}