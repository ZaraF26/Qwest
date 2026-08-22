import React from "react";
import { Pause, Play, Check, X } from "lucide-react";
import { useTimer, formatSeconds } from "@/context/TimerContext";
import Hourglass from "@/components/qwest/Hourglass";

export default function TimerBar({ onComplete }) {
  const { timer, pause, resume, stop, complete } = useTimer();
  if (!timer) return null;
  const progress = timer.totalSeconds ? timer.remainingSeconds / timer.totalSeconds : 0;

  return (
    <div className="parchment-card rounded-2xl border border-primary/30 p-4">
      <div className="flex items-center gap-3">
        <Hourglass progress={progress} size={34} spinning={false} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active timer</p>
          <p className="font-heading text-sm text-foreground truncate">{timer.title}</p>
        </div>
        <div className="font-heading text-xl text-primary tabular-nums">{formatSeconds(timer.remainingSeconds)}</div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        {timer.running ? (
          <button onClick={pause} className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-xl bg-secondary text-secondary-foreground active:scale-95 transition">
            <Pause className="w-4 h-4" /> Pause
          </button>
        ) : (
          <button onClick={resume} className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-xl bg-primary text-primary-foreground active:scale-95 transition">
            <Play className="w-4 h-4" /> Resume
          </button>
        )}
        <button
          onClick={async () => { await complete(); onComplete?.(); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-xl bg-moss text-white active:scale-95 transition"
        >
          <Check className="w-4 h-4" /> Complete
        </button>
        <button onClick={stop} aria-label="Cancel timer" className="inline-flex items-center justify-center w-10 py-2 rounded-xl bg-secondary text-muted-foreground active:scale-95 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}