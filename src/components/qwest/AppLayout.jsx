import React from "react";
import { Outlet } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import CompanionSelection from "@/pages/CompanionSelection";
import BottomNav from "@/components/qwest/BottomNav";
import Hourglass from "@/components/qwest/Hourglass";

export default function AppLayout() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Hourglass spinning size={40} />
          <p className="text-sm text-muted-foreground font-body">Opening the storybook…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <CompanionSelection />;
  }

  return (
    <div className="min-h-screen parchment">
      <main className="mx-auto max-w-md min-h-screen px-4 pt-5 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}