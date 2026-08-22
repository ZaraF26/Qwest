import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

// Single active hourglass timer, persisted to localStorage so it survives reloads.
const STORAGE_KEY = "qwest_timer_v1";

const TimerContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function TimerProvider({ children }) {
  const [timer, setTimer] = useState(loadStored); // { questId, title, totalSeconds, remainingSeconds, running, startedAt }
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer) localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
    else localStorage.removeItem(STORAGE_KEY);
  }, [timer]);

  const tick = useCallback(() => {
    setTimer((t) => {
      if (!t || !t.running) return t;
      const next = Math.max(0, t.remainingSeconds - 1);
      if (next === 0) {
        return { ...t, remainingSeconds: 0, running: false };
      }
      return { ...t, remainingSeconds: next };
    });
  }, []);

  useEffect(() => {
    if (timer?.running) {
      intervalRef.current = setInterval(tick, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [timer?.running, tick]);

  const start = useCallback((quest, minutes) => {
    const totalSeconds = Math.max(1, Math.round((minutes || 15) * 60));
    setTimer({
      questId: quest.id,
      title: quest.title,
      totalSeconds,
      remainingSeconds: totalSeconds,
      running: true,
      startedAt: Date.now(),
    });
  }, []);

  const pause = useCallback(() => setTimer((t) => (t ? { ...t, running: false } : t)), []);
  const resume = useCallback(() => setTimer((t) => (t ? { ...t, running: true } : t)), []);
  const stop = useCallback(() => setTimer(null), []);

  const complete = useCallback(async () => {
    // mark the quest as having used the timer, then clear
    setTimer((t) => {
      if (t?.questId) {
        import("@/api/base44Client").then(({ base44 }) => {
          base44.entities.Quest.update(t.questId, { used_timer: true }).catch(() => {});
        });
      }
      return null;
    });
  }, []);

  return (
    <TimerContext.Provider value={{ timer, start, pause, resume, stop, complete }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}

export function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}