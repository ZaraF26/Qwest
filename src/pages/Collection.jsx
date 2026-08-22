import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { TRINKETS, COLLECTION_CATEGORIES, RARITY_META } from "@/lib/qwest";
import TrinketBadge from "@/components/qwest/TrinketBadge";
import EmptyState from "@/components/qwest/EmptyState";
import Hourglass from "@/components/qwest/Hourglass";
import { cn } from "@/lib/utils";

export default function Collection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    base44.entities.InventoryItem.list("-created_date").then((list) => {
      setItems(list);
      setLoading(false);
    });
  }, []);

  // group by name -> first instance (for unique display) + count
  const owned = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      if (!map.has(it.name)) map.set(it.name, { ...it, count: 1 });
      else map.get(it.name).count += 1;
    });
    return map;
  }, [items]);

  const catalogByCat = useMemo(() => {
    const groups = {};
    COLLECTION_CATEGORIES.forEach((c) => (groups[c] = []));
    TRINKETS.forEach((t) => {
      if (groups[t.category]) groups[t.category].push(t);
    });
    return groups;
  }, []);

  const cats = ["All", ...COLLECTION_CATEGORIES];
  const totalUnique = owned.size;
  const totalCatalog = TRINKETS.length;

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-primary"><Hourglass spinning size={40} /></div>;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-heading text-2xl text-foreground">Your Satchel</h1>
        <p className="text-sm text-muted-foreground">{totalUnique} of {totalCatalog} treasures discovered</p>
        <div className="h-2 mt-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-to-r from-moss to-primary" style={{ width: `${(totalUnique / totalCatalog) * 100}%` }} />
        </div>
      </header>

      {totalUnique === 0 && (
        <EmptyState emoji="🎒" title="Your satchel is empty." subtitle="Complete your first quest to discover a treasure." />
      )}

      {/* category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition",
              activeCat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {COLLECTION_CATEGORIES.filter((c) => activeCat === "All" || activeCat === c).map((cat) => {
        const catalog = catalogByCat[cat] || [];
        const ownedInCat = catalog.filter((t) => owned.has(t.name));
        if (catalog.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="font-heading text-lg text-foreground mb-2">{cat} <span className="text-xs text-muted-foreground">({ownedInCat.length}/{catalog.length})</span></h2>
            <div className="grid grid-cols-4 gap-3">
              {catalog.map((t) => {
                const have = owned.get(t.name);
                return (
                  <div key={t.name} className="flex flex-col items-center text-center">
                    <TrinketBadge item={t} size="md" faded={!have} />
                    <span className={cn("text-[11px] mt-1 leading-tight", have ? "text-foreground" : "text-muted-foreground")}>
                      {have ? t.name : "???"}
                    </span>
                    {have && <span className={cn("text-[9px] uppercase", RARITY_META[t.rarity]?.color)}>{RARITY_META[t.rarity]?.label}</span>}
                    {have?.count > 1 && <span className="text-[10px] text-muted-foreground">×{have.count}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}