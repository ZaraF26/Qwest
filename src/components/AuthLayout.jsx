import React from "react";
import CompassLogo from "@/components/qwest/CompassLogo";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen parchment flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CompassLogo className="w-16 h-16 mx-auto mb-4 drop-shadow-lg animate-gentle-bob" />
          <h1 className="font-heading text-3xl text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>
        <div className="parchment-card rounded-3xl border border-border p-7">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-5">{footer}</p>
        )}
      </div>
    </div>
  );
}