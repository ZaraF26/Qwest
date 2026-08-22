import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { setDailyIntention } from "@/lib/game";
import { toast } from "@/components/ui/use-toast";

export default function DailyIntentionModal({ onDone }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (skip) => {
    setSaving(true);
    try {
      if (!skip && text.trim()) {
        await setDailyIntention(text.trim());
      }
    } catch (e) {
      toast({ title: "Could not save intention", variant: "destructive" });
    } finally {
      setSaving(false);
      onDone?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 parchment flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-3 animate-gentle-bob" aria-hidden="true">🌅</div>
        <h1 className="font-heading text-3xl text-foreground">A New Day Begins…</h1>
        <p className="text-muted-foreground mt-2 mb-6">What is your intention for today?</p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would make today feel meaningful?"
          rows={3}
          className="w-full rounded-2xl border border-border bg-card p-4 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          autoFocus
        />

        <div className="flex flex-col gap-2 mt-5">
          <Button onClick={() => submit(false)} disabled={saving} className="h-12 text-base font-heading">
            {saving ? "Beginning…" : "Begin Today's Qwest"}
          </Button>
          <Button onClick={() => submit(true)} variant="ghost" disabled={saving} className="text-muted-foreground">
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}