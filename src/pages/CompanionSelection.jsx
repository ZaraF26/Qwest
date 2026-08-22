import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMPANIONS } from "@/lib/qwest";
import { useProfile } from "@/context/ProfileContext";
import { createProfile } from "@/lib/game";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function CompanionSelection() {
  const { reload } = useProfile();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!companion) {
      toast({ title: "Choose a companion first", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Give your companion a name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createProfile({ companion, display_name: name.trim() });
      await reload();
      navigate("/home", { replace: true });
    } catch (e) {
      toast({ title: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen parchment px-5 py-8 flex flex-col">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2 animate-gentle-bob" aria-hidden="true">🌲</div>
        <h1 className="font-heading text-3xl text-foreground">Choose Your Companion</h1>
        <p className="text-muted-foreground mt-1 text-sm">A small forest creature to walk the path with you.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
        {COMPANIONS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCompanion(c.key)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
              companion === c.key ? "border-primary bg-primary/10 scale-[1.03]" : "border-border bg-card hover:bg-secondary/60"
            )}
            aria-pressed={companion === c.key}
          >
            <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
            <span className="text-xs font-medium text-foreground">{c.name}</span>
          </button>
        ))}
      </div>

      {companion && (
        <p className="text-center text-sm text-muted-foreground italic mb-6">
          {COMPANIONS.find((c) => c.key === companion)?.blurb}
        </p>
      )}

      <div className="space-y-2 mb-6">
        <Label htmlFor="name" className="text-foreground">Your display name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What shall we call you?"
          className="h-12"
          maxLength={32}
        />
      </div>

      <Button onClick={submit} disabled={saving} className="h-14 text-base font-heading mt-auto">
        {saving ? "Stepping into the woods…" : "Begin the Adventure"}
      </Button>
    </div>
  );
}