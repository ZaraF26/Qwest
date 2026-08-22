import React from "react";
import { cn } from "@/lib/utils";

const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

export default function CompassLogo({ className, size }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(className)}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Qwest compass"
    >
      <defs>
        <radialGradient id="qw-brass" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#F3D78E" />
          <stop offset="55%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#7C5F26" />
        </radialGradient>
        <radialGradient id="qw-bowl" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#816099" />
          <stop offset="68%" stopColor="#5B4170" />
          <stop offset="100%" stopColor="#3F2D52" />
        </radialGradient>
      </defs>

      {/* warm brass/gold casing */}
      <circle cx="60" cy="60" r="56" fill="url(#qw-brass)" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#6F531F" strokeWidth="1.2" opacity="0.55" />

      {/* purple bowl */}
      <circle cx="60" cy="60" r="44" fill="url(#qw-bowl)" />

      {/* compass tick marks */}
      <g stroke="#E6C76C" strokeLinecap="round" opacity="0.75">
        {TICKS.map((deg) => {
          const major = deg % 90 === 0;
          const rad = ((deg - 90) * Math.PI) / 180;
          const ro = 44;
          const ri = major ? 35 : 39;
          return (
            <line
              key={deg}
              x1={60 + ro * Math.cos(rad)}
              y1={60 + ro * Math.sin(rad)}
              x2={60 + ri * Math.cos(rad)}
              y2={60 + ri * Math.sin(rad)}
              strokeWidth={major ? 2 : 1.1}
            />
          );
        })}
      </g>

      {/* compass needle */}
      <polygon points="60,22 53,60 67,60" fill="#F3D78E" stroke="#6F531F" strokeWidth="0.6" />
      <polygon points="60,98 53,60 67,60" fill="#7C5F26" />
      <circle cx="60" cy="60" r="5" fill="#3A2A45" stroke="#E6C76C" strokeWidth="1.2" />

      {/* a simple Q, subtly incorporated: a brass tail crossing the lower-right */}
      <line x1="70" y1="70" x2="99" y2="99" stroke="url(#qw-brass)" strokeWidth="6" strokeLinecap="round" />
      <line x1="70" y1="70" x2="99" y2="99" stroke="#7C5F26" strokeWidth="1.4" opacity="0.45" strokeLinecap="round" />
    </svg>
  );
}