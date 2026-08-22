import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/lib/AuthContext";
import { calcLevel, ACHIEVEMENTS, COMPANIONS, TRINKETS } from "@/lib/qwest";
import CompanionAvatar from "@/components/qwest/CompanionAvatar";
import LevelBar from "@/components/qwest/LevelBar";
import StatTile from "@/components/qwest/StatTile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Award, LogOut, Pencil } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { profile, reload } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [companion, setCompanion] = useState(null);

  useEffect(() => {
    base44.entities.Achievement.list("-created_date").then(setAchievements);
    base44.entities.InventoryItem.list().then(setItems);
  }, []);

  if (!profile) return null;
  const lvl = calcLevel(profile.xp || 0);
  const uniqueTrinkets = new Set(items.map((i) => i.name)).size;
  const unlockedKeys = new Set(ACHIEVEMENTS.filter((a) => achievements.some((x) => x.key === a.key)).map((a) => a.key));

  const saveEdit = async () => {
    const patch = {};
    if (name.trim() && name.trim() !== profile.display_name) patch.display_name = name.trim();
    if (companion) patch.companion = companion;
    if (Object.keys(patch).length) {
      await base44.entities.Profile.update(profile.id, patch);
      await reload();
      toast({ title: "Your companion has been updated" });
    }
    setEditing(false);
  };

  const saveSettings = async (patch) => {
    await base44.entities.Profile.update(profile.id, patch);
    await reload();
  };

  return (
    <div className="space-y-5">
      <header className="parchment-card rounded-3xl border border-border p-5 text-center">
        <CompanionAvatar companion={profile.companion} size="xl" className="mx-auto" />
        <h1 className="font-heading text-2xl text-foreground mt-3">{profile.display_name}</h1>
        <p className="text-sm text-muted-foreground">Level {lvl.level} · {lvl.title}</p>
        <div className="mt-4 max-w-xs mx-auto"><LevelBar xp={profile.xp} /></div>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => { setEditing(true); setName(profile.display_name); setCompanion(profile.companion); }}>
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit companion
        </Button>
      </header>

      {editing && (
        <div className="parchment-card rounded-2xl border border-border p-4 space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="h-11" />
          <div className="grid grid-cols-6 gap-2">
            {COMPANIONS.map((c) => (
              <button key={c.key} onClick={() => setCompanion(c.key)}
                className={`p-2 rounded-xl border text-2xl ${companion === c.key ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                aria-label={c.name}>
                {c.emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={saveEdit} className="flex-1">Save</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <section>
        <h2 className="font-heading text-xl text-foreground mb-3">My Journey</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Total Quests" value={profile.total_quests || 0} />
          <StatTile label="Current Level" value={lvl.level} />
          <StatTile label="Total XP" value={profile.xp || 0} />
          <StatTile label="Gold" value={profile.gold || 0} accent="text-gold" />
          <StatTile label="Current Streak" value={`${profile.streak || 0}d`} accent="text-terracotta" />
          <StatTile label="Longest Streak" value={`${profile.longest_streak || 0}d`} accent="text-terracotta" />
          <StatTile label="Main Quests" value={profile.total_main || 0} />
          <StatTile label="Side Quests" value={profile.total_side || 0} />
          <StatTile label="Timed Quests" value={profile.timed_quests || 0} />
          <StatTile label="Trinkets" value={`${uniqueTrinkets}/${TRINKETS.length}`} />
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="font-heading text-xl text-foreground mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-plum" /> Achievements</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const got = unlockedKeys.has(a.key);
            return (
              <div key={a.key} className={`parchment-card rounded-2xl border p-3 flex items-center gap-3 ${got ? "border-gold/50" : "border-border opacity-60"}`}>
                <span className="text-2xl" aria-hidden="true">{got ? a.icon : "🔒"}</span>
                <div>
                  <p className="font-heading text-sm text-foreground">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="parchment-card rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-heading text-lg text-foreground">Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Daily reminders</p>
            <p className="text-xs text-muted-foreground">A gentle nudge to begin your day</p>
          </div>
          <Switch checked={!!profile.notifications_enabled} onCheckedChange={(v) => saveSettings({ notifications_enabled: v })} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-foreground font-medium">Reminder time</p>
            <p className="text-xs text-muted-foreground">When to prompt your intention</p>
          </div>
          <Input type="time" value={profile.daily_reminder_time || "08:00"} onChange={(e) => saveSettings({ daily_reminder_time: e.target.value })} className="w-32 h-10" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Carry over unfinished quests</p>
            <p className="text-xs text-muted-foreground">Keep them on tomorrow's board</p>
          </div>
          <Switch checked={!!profile.carry_over_quests} onCheckedChange={(v) => saveSettings({ carry_over_quests: v })} />
        </div>
      </section>

      <Button variant="outline" className="w-full h-12 text-destructive" onClick={() => logout()}>
        <LogOut className="w-4 h-4 mr-2" /> Leave the forest (Log out)
      </Button>
      <p className="text-center text-xs text-muted-foreground pb-2">Qwest · {new Date().getFullYear()}</p>
    </div>
  );
}