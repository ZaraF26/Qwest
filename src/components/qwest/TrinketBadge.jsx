import React from "react";
import { RARITY_META } from "@/lib/qwest";
import { cn } from "@/lib/utils";

export default function TrinketBadge({ item, size = "md", faded = false }) {
  const rarity = RARITY_META[item.rarity] || RARITY_META.common;
  const sizes = {
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-20 h-20 text-4xl",
  };
  return (
    <div
      className={cn(
        "relative rounded-2xl flex items-center justify-center bg-card ring-1",
        rarity.ring,
        sizes[size],
        faded && "opacity-40 grayscale"
      )}
      title={item.name}
    >
      <span aria-hidden="true">{faded ? "❔" : item.emoji}</span>
    </div>
  );
}