import React from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({ emoji = "🍃", title, subtitle, className }) {
  return (
    <div className={cn("text-center py-10 px-6", className)}>
      <div className="text-5xl mb-3 opacity-80 animate-gentle-bob" aria-hidden="true">{emoji}</div>
      <h3 className="font-heading text-lg text-foreground">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{subtitle}</p>}
    </div>
  );
}