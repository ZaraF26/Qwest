import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/context/ProfileContext";
import { MAP_LOCATIONS } from "@/lib/qwest";
import { useKeyOnLocation as unlockWithKey } from "@/lib/game";
import Hourglass from "@/components/qwest/Hourglass";
import CompanionAvatar from "@/components/qwest/CompanionAvatar";
import { Lock, Key as KeyIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAP_BG = "https://media.base44.com/images/public/6a89f3946ca484ecc6a1aa0f/354826610_generated_image.png";

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

      <div className="relative rounded-3xl overflow-hidden border-2 border-primary/30 shadow-lg">
        <img src={MAP_BG} alt="Illustrated fantasy forest map" className="block w-full h-auto align-middle" />
        <div className="absolute inset-0 bg-foreground/10" />

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