import React from "react";
import { cn } from "@/lib/utils";

export default function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="parchment-card rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("w-4 h-4", accent || "text-primary")} aria-hidden="true" />}
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <span className="font-heading text-2xl text-foreground">{value}</span>
    </div>
  );
}