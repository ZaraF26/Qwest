import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import CompassLogo from "@/components/qwest/CompassLogo";

const HERO = "https://media.base44.com/images/public/6a89f3946ca484ecc6a1aa0f/bd6a23806_generated_image.png";

export default function Welcome() {
  const { isAuthenticated, authChecked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authChecked && isAuthenticated) navigate("/home", { replace: true });
  }, [authChecked, isAuthenticated, navigate]);

  const returnTo = encodeURIComponent("/home");

  return (
    <div className="min-h-screen parchment flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="absolute inset-0">
          <Image src={HERO} alt="A cosy cottage in an enchanted forest at dusk" fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/20 to-foreground/70" />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-end pb-10 px-6 text-center">
          <CompassLogo className="w-16 h-16 mb-3 drop-shadow-lg animate-gentle-bob" />
          <div className="flex items-center gap-2 mb-3 text-gold animate-sparkle" aria-hidden="true">
            <Sparkles className="w-5 h-5" /><span className="text-sm tracking-[0.3em] uppercase">A productivity quest</span><Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-heading text-6xl text-white drop-shadow-lg tracking-tight">Qwest</h1>
          <p className="font-heading italic text-xl text-white/90 mt-2">Turn your to-do list into an adventure.</p>

          <div className="w-full max-w-sm mt-10 space-y-3">
            <Link to={`/register?returnTo=${returnTo}`}>
              <Button className="w-full h-14 text-lg font-heading bg-primary text-primary-foreground">
                Begin Your Quest
              </Button>
            </Link>
            <Link to={`/login?returnTo=${returnTo}`}>
              <Button variant="outline" className="w-full h-14 text-base bg-card/90 backdrop-blur border-border">Log In</Button>
            </Link>
          </div>
          <p className="text-white/70 text-xs mt-6 max-w-xs">Your real life becomes the quest. Complete tasks, earn treasures, and wander a cosy fantasy world.</p>
        </div>
      </div>
    </div>
  );
}