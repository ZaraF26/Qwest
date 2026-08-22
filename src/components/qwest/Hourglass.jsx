import React from "react";
import { cn } from "@/lib/utils";

// An hourglass that visually drains as a fraction (0..1 of time remaining).
// Used as the timer motif and the loading spinner.
export default function Hourglass({ progress = 1, size = 28, spinning = false, className }) {
  // progress: 1 = full (top full of sand), 0 = empty
  const topFill = Math.max(0, Math.min(1, progress));
  const bottomFill = 1 - topFill;
  return (
    <span
      className={cn("inline-block align-middle", spinning && "animate-hourglass-spin", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="hourglass"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        {/* frame */}
        <path d="M6 3h12M6 21h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 3c0 4 4 5 5 6c1-1 5-2 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.5" />
        <path d="M7 21c0-4 4-5 5-6c1 1 5 2 5 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.5" />
        {/* top sand */}
        <clipPath id="hg-top">
          <path d="M7.4 3.4h9.2v6.2c0 0-2.6 1.6-4.6 3.4c-2-1.8-4.6-3.4-4.6-3.4z" />
        </clipPath>
        <g clipPath="url(#hg-top)">
          <rect x="7" y={3.4 + (1 - topFill) * 6.2} width="10" height={topFill * 6.2 + 0.2} fill="hsl(var(--gold))" />
        </g>
        {/* bottom sand pile */}
        <clipPath id="hg-bot">
          <path d="M7.4 20.6h9.2v-6.2c0 0-2.6-1.6-4.6-3.4c-2 1.8-4.6 3.4-4.6 3.4z" />
        </clipPath>
        <g clipPath="url(#hg-bot)">
          <path d={`M12 ${20.6} L${12 - bottomFill * 4.2} ${20.6} Q12 ${20.6 - bottomFill * 3.4} ${12 + bottomFill * 4.2} ${20.6} Z`} fill="hsl(var(--gold))" />
        </g>
        {/* falling grain */}
        {spinning === false && progress > 0 && progress < 1 && (
          <rect x="11.7" y="11" width="0.6" height="2.4" fill="hsl(var(--gold))" />
        )}
      </svg>
    </span>
  );
}