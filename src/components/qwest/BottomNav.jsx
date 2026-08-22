import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Map, Backpack, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/collection", label: "Collection", icon: Backpack },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto relative parchment-card rounded-3xl border border-border shadow-lg flex items-center justify-between px-4 py-2">
          {tabs.slice(0, 2).map((t) => <NavTab key={t.to} {...t} />)}
          <button
            onClick={() => navigate("/quests/new")}
            className="flex flex-col items-center -mt-8"
            aria-label="Create a new quest"
          >
            <span className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-background active:scale-95 transition">
              <Plus className="w-7 h-7" />
            </span>
          </button>
          {tabs.slice(2).map((t) => <NavTab key={t.to} {...t} />)}
        </div>
      </div>
    </nav>
  );
}

function NavTab({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px]",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}