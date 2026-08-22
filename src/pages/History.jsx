import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { todayStr } from "@/lib/qwest";
import Hourglass from "@/components/qwest/Hourglass";
import EmptyState from "@/components/qwest/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

export default function History() {
  const [quests, setQuests] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [selectedDate, setSelectedDate] = useState(todayStr());

  useEffect(() => {
    Promise.all([
      base44.entities.Quest.list("-scheduled_date"),
      base44.entities.DailyIntention.list("-date"),
    ]).then(([q, i]) => {
      setQuests(q);
      setIntentions(i);
      setLoading(false);
    });
  }, []);

  const byDate = useMemo(() => {
    const map = new Map();
    quests.forEach((q) => {
      const d = q.scheduled_date || q.completed_date;
      if (!d) return;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(q);
    });
    return map;
  }, [quests]);

  const intentionByDate = useMemo(() => {
    const map = new Map();
    intentions.forEach((i) => map.set(i.date, i.intention));
    return map;
  }, [intentions]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-primary"><Hourglass spinning size={40} /></div>;

  const cells = monthMatrix(cursor.y, cursor.m);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

  const selQuests = byDate.get(selectedDate) || [];
  const selIntention = intentionByDate.get(selectedDate);
  const completed = selQuests.filter((q) => q.status === "completed");
  const missed = selQuests.filter((q) => q.status !== "completed");
  const xp = completed.reduce((s, q) => s + (q.xp_value || 0), 0);

  const move = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl text-foreground">Your Journey So Far</h1>
        <p className="text-sm text-muted-foreground">Look back at the paths you've walked.</p>
      </header>

      <div className="parchment-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
          <span className="font-heading text-foreground">{monthName}</span>
          <button onClick={() => move(1)} aria-label="Next month"><ChevronRight className="w-5 h-5 text-foreground" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const ds = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dayQuests = byDate.get(ds) || [];
            const done = dayQuests.some((q) => q.status === "completed");
            const isToday = ds === todayStr();
            const isSel = ds === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(ds)}
                className={cn(
                  "aspect-square rounded-lg text-xs flex items-center justify-center relative transition",
                  isSel ? "bg-primary text-primary-foreground" : done ? "bg-moss/20 text-foreground" : "bg-card text-foreground",
                  isToday && !isSel && "ring-1 ring-primary"
                )}
              >
                {d}
                {done && !isSel && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-moss" />}
              </button>
            );
          })}
        </div>
      </div>

      <section className="parchment-card rounded-2xl border border-border p-4">
        <h2 className="font-heading text-lg text-foreground">{selectedDate === todayStr() ? "Today" : selectedDate}</h2>
        {selIntention && <p className="font-heading italic text-muted-foreground mt-1">“{selIntention}”</p>}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div><p className="font-heading text-xl text-primary">{xp}</p><p className="text-[10px] text-muted-foreground">XP</p></div>
          <div><p className="font-heading text-xl text-moss">{completed.length}</p><p className="text-[10px] text-muted-foreground">Done</p></div>
          <div><p className="font-heading text-xl text-muted-foreground">{missed.length}</p><p className="text-[10px] text-muted-foreground">Open</p></div>
        </div>
        {selQuests.length === 0 ? (
          <EmptyState emoji="📖" title="A quiet day." subtitle="No quests recorded for this day." className="py-6" />
        ) : (
          <ul className="mt-3 space-y-2">
            {selQuests.map((q) => (
              <li key={q.id} className="flex items-center gap-2 text-sm">
                <span className={cn("w-2 h-2 rounded-full", q.status === "completed" ? "bg-moss" : "bg-muted-foreground/40")} />
                <span className={cn("flex-1 truncate", q.status === "completed" && "line-through text-muted-foreground")}>{q.title}</span>
                <span className="text-xs text-gold">+{q.xp_value}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}