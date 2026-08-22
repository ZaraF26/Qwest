import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Coins, Flame, Map as MapIcon, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/context/ProfileContext";
import { useTimer } from "@/context/TimerContext";
import { todayStr, calcLevel, MAP_LOCATIONS } from "@/lib/qwest";
import { completeQuest, getTodaysIntention } from "@/lib/game";
import CompanionAvatar from "@/components/qwest/CompanionAvatar";
import LevelBar from "@/components/qwest/LevelBar";
import QuestCard from "@/components/qwest/QuestCard";
import TimerBar from "@/components/qwest/TimerBar";
import RewardModal from "@/components/qwest/RewardModal";
import DailyIntentionModal from "@/components/qwest/DailyIntentionModal";
import EmptyState from "@/components/qwest/EmptyState";
import TrinketBadge from "@/components/qwest/TrinketBadge";

export default function Home() {
  const { profile, reload } = useProfile();
  const { timer } = useTimer();
  const [quests, setQuests] = useState([]);
  const [intention, setIntention] = useState(null);
  const [intentionLoaded, setIntentionLoaded] = useState(false);
  const [intentionDismissed, setIntentionDismissed] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [qs, intent, items] = await Promise.all([
      base44.entities.Quest.filter({ scheduled_date: todayStr() }, "created_date"),
      getTodaysIntention(),
      base44.entities.InventoryItem.filter({ date_collected: todayStr() }, "-created_date", 20),
    ]);
    setQuests(qs);
    setIntention(intent);
    setIntentionLoaded(true);
    setRewards(items);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleComplete = async (quest) => {
    try {
      const res = await completeQuest(quest, profile);
      setResult(res);
      await reload();
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return null;

  const lvl = calcLevel(profile.xp || 0);
  const mainQuests = quests.filter((q) => q.type === "main" && q.status !== "completed");
  const sideQuests = quests.filter((q) => q.type === "side" && q.status !== "completed");
  const completedToday = quests.filter((q) => q.status === "completed");
  const xpToday = completedToday.reduce((s, q) => s + (q.xp_value || 0), 0);
  const goldToday = completedToday.reduce((s, q) => s + (q.gold_value || 0), 0);

  const showIntention = intentionLoaded && !intention && !intentionDismissed;

  // furthest unlocked location for map preview
  const unlocked = MAP_LOCATIONS.filter((l) => (profile.xp || 0) >= l.required_xp);
  const current = unlocked[unlocked.length - 1] || MAP_LOCATIONS[0];

  return (
    <div className="space-y-5">
      {showIntention && <DailyIntentionModal onDone={() => { setIntentionDismissed(true); refresh(); }} />}

      {/* Header */}
      <header className="parchment-card rounded-3xl border border-border p-4">
        <div className="flex items-center gap-3">
          <CompanionAvatar companion={profile.companion} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-heading text-lg text-foreground truncate">{profile.display_name}</p>
            <p className="text-xs text-muted-foreground">Level {lvl.level} · {lvl.title}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-gold font-heading text-sm"><Coins className="w-4 h-4" />{profile.gold || 0}</span>
            {profile.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-terracotta font-heading text-sm"><Flame className="w-4 h-4" />{profile.streak}d</span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <LevelBar xp={profile.xp} />
        </div>
      </header>

      {/* Intention */}
      <section className="parchment-card rounded-2xl border border-border p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Today's Intention</p>
        {intention ? (
          <p className="font-heading italic text-foreground">“{intention}”</p>
        ) : (
          <p className="text-sm text-muted-foreground">No intention set yet — what would make today feel meaningful?</p>
        )}
      </section>

      {/* Timer */}
      {timer && <TimerBar onComplete={refresh} />}

      {/* Main quests */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-xl text-foreground">Main Quests</h2>
          <span className="text-xs text-muted-foreground">{mainQuests.length}/3</span>
        </div>
        {mainQuests.length === 0 && !loading ? (
          <EmptyState emoji="🗺️" title="Your quest board is waiting." subtitle="Choose up to three quests that matter most today." />
        ) : (
          <div className="space-y-3">
            {mainQuests.map((q) => <QuestCard key={q.id} quest={q} onComplete={handleComplete} />)}
          </div>
        )}
      </section>

      {/* Side quests */}
      <section>
        <h2 className="font-heading text-xl text-foreground mb-2">Side Quests</h2>
        {sideQuests.length === 0 && !loading ? (
          <EmptyState emoji="🍃" title="No adventure is too small to begin." subtitle="Add a side quest — a small step still moves you forward." />
        ) : (
          <div className="space-y-3">
            {sideQuests.map((q) => <QuestCard key={q.id} quest={q} onComplete={handleComplete} />)}
          </div>
        )}
      </section>

      {/* Today's progress */}
      <section className="parchment-card rounded-2xl border border-border p-4">
        <h2 className="font-heading text-lg text-foreground mb-3">Today's Progress</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="font-heading text-2xl text-primary">{xpToday}</p><p className="text-xs text-muted-foreground">XP earned</p></div>
          <div><p className="font-heading text-2xl text-gold">{goldToday}</p><p className="text-xs text-muted-foreground">Gold</p></div>
          <div><p className="font-heading text-2xl text-foreground">{completedToday.length}</p><p className="text-xs text-muted-foreground">Quests done</p></div>
        </div>
      </section>

      {/* Today's rewards */}
      {rewards.length > 0 && (
        <section>
          <h2 className="font-heading text-lg text-foreground mb-2">Today's Treasures</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {rewards.map((r, i) => <TrinketBadge key={i} item={r} size="md" />)}
          </div>
        </section>
      )}

      {/* Map preview */}
      <Link to="/map" className="block parchment-card rounded-2xl border border-border p-4 active:scale-[0.99] transition">
        <div className="flex items-center gap-3">
          <MapIcon className="w-6 h-6 text-moss" />
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Current position</p>
            <p className="font-heading text-foreground">{current.name}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}