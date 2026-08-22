import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/context/ProfileContext";
import { MAP_LOCATIONS } from "@/lib/qwest";
import { useKeyOnLocation as unlockWithKey } from "@/lib/game";
import Hourglass from "@/components/qwest/Hourglass";
import CompanionAvatar from "@/components/qwest/CompanionAvatar";
import CompassLogo from "@/components/qwest/CompassLogo";
import { Lock, Key as KeyIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const { profile } = useProfile();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await base44.entities.MapLocation.list("order");
    setLocations(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-primary">
        <Hourglass spinning size={40} />
      </div>
    );
  }

  const xp = profile.xp || 0;
  const furthestUnlockedOrder = Math.max(0, ...locations.filter((l) => l.unlocked).map((l) => l.order));
  const currentLocation = locations.find((l) => l.order === furthestUnlockedOrder) || locations[0];

  const handleUseKey = async (loc) => {
    setBusy(true);
    try {
      const res = await unlockWithKey(loc, profile);
      if (res.ok) {
        await load();
        setSelected(null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <CompanionAvatar companion={profile.companion} size="sm" />
        <div>
          <h1 className="font-heading text-2xl text-foreground">The World Map</h1>
          <p className="text-xs text-muted-foreground">Now at: {currentLocation?.name}</p>
        </div>
      </header>

      <div className="relative rounded-3xl overflow-hidden border-2 border-primary/30 shadow-lg aspect-[3/4] parchment-card">
        {/* faint compass watermark */}
        <CompassLogo className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 opacity-[0.06] pointer-events-none z-0" />

        {/* region labels */}
        <span className="absolute z-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-heading" style={{ left: "20%", top: "76%" }}>Home</span>
        <span className="absolute z-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-heading" style={{ left: "55%", top: "60%" }}>Forest</span>
        <span className="absolute z-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-heading" style={{ left: "64%", top: "47%" }}>Village</span>
        <span className="absolute z-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-heading" style={{ left: "70%", top: "37%" }}>Deep Woods</span>
        <span className="absolute z-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-heading" style={{ left: "53%", top: "16%" }}>The Hollow</span>

        {/* dotted trails between locations */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {[...locations].sort((a, b) => a.order - b.order).map((loc, i, arr) => {
            if (i === arr.length - 1) return null;
            const a = arr[i];
            const b = arr[i + 1];
            const open = a.unlocked && b.unlocked;
            return (
              <line
                key={i}
                x1={a.pos_x} y1={a.pos_y} x2={b.pos_x} y2={b.pos_y}
                stroke={open ? "hsl(var(--primary))" : "hsl(var(--border))"}
                strokeWidth={open ? 2 : 1.5}
                strokeDasharray="4 6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={open ? 0.6 : 0.5}
              />
            );
          })}
        </svg>

        {/* Path dots + locations */}
        {locations.map((loc) => {
          const xpMet = xp >= loc.required_xp;
          const isCurrent = loc.order === furthestUnlockedOrder;
          const locked = !loc.unlocked;
          const keyLocked = loc.required_key && xpMet && !loc.unlocked;
          return (
            <button
              key={loc.id}
              onClick={() => setSelected(loc)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${loc.pos_x}%`, top: `${loc.pos_y}%` }}
              aria-label={loc.name}
            >
              <span
                className={cn(
                  "relative w-11 h-11 rounded-full flex items-center justify-center text-xl ring-2 transition",
                  loc.unlocked ? "bg-card ring-primary/60 shadow-md" : "bg-secondary/90 ring-border",
                  isCurrent && "ring-gold ring-4 animate-gentle-bob"
                )}
              >
                {locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <span aria-hidden="true">{loc.icon}</span>}
                {keyLocked && <KeyIcon className="absolute -top-1 -right-1 w-3.5 h-3.5 text-gold" />}
              </span>
              <span className={cn("text-[10px] mt-0.5 px-1 rounded bg-card/80", loc.unlocked ? "text-foreground" : "text-muted-foreground")}>
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">Tap a location to inspect it. Earn XP to reach new places; some doors need a key.</p>

      {/* Location detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md parchment-card rounded-t-3xl border border-border p-5 pb-8 animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{selected.region}</p>
                <h2 className="font-heading text-2xl text-foreground">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{selected.description}</p>

            {selected.unlocked ? (
              <p className="mt-4 text-moss font-medium">Discovered!</p>
            ) : xp < selected.required_xp ? (
              <p className="mt-4 text-sm text-muted-foreground">Reach {selected.required_xp} XP to find this place. ({selected.required_xp - xp} XP to go)</p>
            ) : selected.required_key ? (
              <div className="mt-4">
                <p className="text-sm text-foreground mb-2">An old door stands before you. It needs the <span className="font-semibold">{selected.required_key.replace(/_/g, " ")}</span>.</p>
                <button
                  onClick={() => handleUseKey(selected)}
                  disabled={busy}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-medium active:scale-95 transition inline-flex items-center justify-center gap-2"
                >
                  <KeyIcon className="w-4 h-4" /> Use Key
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">You've reached this place — it will be revealed soon.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}