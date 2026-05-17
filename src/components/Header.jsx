import React from "react";
import { UserMenu } from "@/components/UserMenu.jsx";

export function Header({ title = "Precipitation Rate Monitoring System" }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold sm:text-xs sm:tracking-[0.3em]">Monitoring Center</p>
        <h1 className="truncate text-2xl font-black text-foreground tracking-tight">{title}</h1>
      </div>
      <UserMenu />
    </header>
  );
}
