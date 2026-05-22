import React from "react";
import { UserMenu } from "@/components/UserMenu.jsx";

export function Header({ title = "Precipitation Rate Monitoring System" }) {
  return (
    <header className="sticky top-0 z-30 -mx-6 flex min-h-[88px] flex-col justify-center gap-4 border-b border-border/60 bg-background px-6 py-3 sm:flex-row sm:items-center sm:justify-between md:-mx-12 md:min-h-[92px] md:px-12 lg:-mx-14 lg:px-14">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold sm:text-xs sm:tracking-[0.3em]">Monitoring Center</p>
        <h1 className="truncate text-2xl font-black text-foreground tracking-tight">{title}</h1>
      </div>
      <UserMenu />
    </header>
  );
}
