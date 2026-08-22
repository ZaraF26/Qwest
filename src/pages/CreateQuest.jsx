import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, DURATIONS, calcQuestValue, todayStr } from "@/lib/qwest";
import { ArrowLeft, Crown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function CreateQuest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("side");
  const [duration, setDuration] = useState(15);
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(todayStr());
  const [dueTime, setDueTime] = useState("");
  const [mainCount, setMainCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Quest.filter({ scheduled_date: todayStr(), type: "main", status: "active" }, "created_date").then((q) => setMainCount(q.length));
  }, []);

  const value = useMemo(() => calcQuestValue(type, duration), [type, duration]);
  const mainLocked = type === "main" && mainCount >= 3;

  const submit = async () => {
    if (!title.trim()) { toast({ title: "Give your quest a name", variant: "destructive" }); return; }
    if (mainLocked) { toast({ title: "You already have 3 Main Quests today", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.entities.Quest.create({
        title: title.trim(),
        type,
        scheduled_date: dueDate || todayStr(),
        due_date: dueDate || null,
        due_time: dueTime || null,
        estimated_minutes: duration,
        category: category || null,
        status: "active",
        xp_value: value.xp,
        gold_value: value.gold,
      });
      navigate("/home");
    } catch (e) {
      toast({ title: e.message || "Could not create quest", variant: "destructive" });
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/home")} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-heading text-2xl text-foreground">A New Quest</h1>

      <div className="parchment-card rounded-2xl border border-border p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">What is your quest?</Label>
          <Textarea id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish client proposal" rows={2} autoFocus />
        </div>

        <div className="space-y-2">
          <Label>Main Quest or Side Quest?</Label>
          <div className="grid grid-cols-2 gap-2">
            {["main", "side"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "py-3 rounded-2xl border text-sm font-medium transition",
                  type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                )}
              >
                {t === "main" ? "Main Quest" : "Side Quest"}
              </button>
            ))}
          </div>
          {mainLocked && <p className="text-xs text-destructive">You've chosen 3 Main Quests for today. Make this a Side Quest, or complete one first.</p>}
        </div>

        <div className="space-y-2">
          <Label>How long will it take?</Label>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setDuration(d.minutes)}
                className={cn(
                  "py-2 rounded-xl border text-xs font-medium transition",
                  duration === d.minutes ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category (optional)</Label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setCategory("")} className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs border", !category ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground")}>None</button>
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)} className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs border inline-flex items-center gap-1", category === c.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground")}>
                <span aria-hidden="true">{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="due">When is it due?</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time (optional)</Label>
            <Input id="time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="h-11" />
          </div>
        </div>
      </div>

      {/* Auto valuation */}
      <div className="parchment-card rounded-2xl border border-gold/40 p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Reward (set automatically)</p>
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center">
            <Crown className="w-5 h-5 text-primary mb-1" />
            <span className="font-heading text-2xl text-primary">{value.xp} XP</span>
          </div>
          <div className="flex flex-col items-center">
            <Coins className="w-5 h-5 text-gold mb-1" />
            <span className="font-heading text-2xl text-gold">+{value.gold}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">Bigger quests earn bigger rewards — but you can't inflate them.</p>
      </div>

      <Button onClick={submit} disabled={saving || mainLocked} className="w-full h-14 text-base font-heading">
        {saving ? "Adding to your board…" : "Add to Quest Board"}
      </Button>
    </div>
  );
}