import React, { useEffect } from "react";
import { X, Sparkles, Coins, MapPin, Key as KeyIcon, Award } from "lucide-react";
import TrinketBadge from "@/components/qwest/TrinketBadge";
import { RARITY_META, calcLevel } from "@/lib/qwest";

export default function RewardModal({ result, onClose }) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [result, onClose]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="parchment-card rounded-3xl border border-border shadow-2xl w-full max-w-sm p-6 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground" aria-label="Close"><X className="w-5 h-5" /></button>
        <div className="text-center">
          <div className="text-4xl mb-1 animate-gentle-bob" aria-hidden="true">✨</div>
          <h2 className="font-heading text-2xl text-foreground">Quest complete!</h2>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-primary mb-1" />
              <span className="font-heading text-xl text-primary">+{result.xp} XP</span>
            </div>
            {result.gold > 0 && (
              <div className="flex flex-col items-center">
                <Coins className="w-5 h-5 text-gold mb-1" />
                <span className="font-heading text-xl text-gold">+{result.gold}</span>
              </div>
            )}
          </div>

          {result.reward && (
            <div className="mt-5 flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">Your satchel gained a new treasure</p>
              <TrinketBadge item={result.reward} size="lg" />
              <p className="font-heading text-foreground mt-2">{result.reward.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{RARITY_META[result.reward.rarity]?.label}</p>
            </div>
          )}

          {result.leveledUp && (
            <div className="mt-5 p-3 rounded-2xl bg-primary/10 text-primary">
              <p className="font-heading text-lg">Your journey continues…</p>
              <p className="text-sm">Level {result.newLevel} — {calcLevel(result.profile.xp).title}</p>
            </div>
          )}

          {(result.newLocations.length > 0 || result.newKeys.length > 0 || result.newAchievements.length > 0) && (
            <div className="mt-4 space-y-1.5 text-left text-sm">
              {result.newLocations.map((l) => (
                <p key={l} className="flex items-center gap-2 text-foreground"><MapPin className="w-4 h-4 text-moss" /> Discovered: {l}</p>
              ))}
              {result.newKeys.map((k) => (
                <p key={k.key} className="flex items-center gap-2 text-foreground"><KeyIcon className="w-4 h-4 text-gold" /> Found a key: {k.name}</p>
              ))}
              {result.newAchievements.map((a) => (
                <p key={a.key} className="flex items-center gap-2 text-foreground"><Award className="w-4 h-4 text-plum" /> Achievement: {a.name}</p>
              ))}
            </div>
          )}

          <button onClick={onClose} className="mt-6 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-medium active:scale-95 transition">
            Onward
          </button>
        </div>
      </div>
    </div>
  );
}