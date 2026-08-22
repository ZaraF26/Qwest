import React from "react";
import { COMPANIONS } from "@/lib/qwest";
import { cn } from "@/lib/utils";

export default function CompanionAvatar({ companion, size = "md", className }) {
  const c = COMPANIONS.find((x) => x.key === companion) || COMPANIONS[0];
  const sizes = {
    xs: "w-9 h-9 text-lg",
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-24 h-24 text-5xl",
    xl: "w-32 h-32 text-6xl",
  };
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent/60 ring-2 ring-primary/20 shadow-inner",
        sizes[size],
        className
      )}
      role="img"
      aria-label={`${c.name} companion`}
    >
      <span className="animate-gentle-bob">{c.emoji}</span>
    </div>
  );
}