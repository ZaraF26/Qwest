import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { loadProfile } from "@/lib/game";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const p = await loadProfile();
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadProfile().then((p) => {
      if (active) {
        setProfile(p);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isAuthenticated, user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading, reload }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}