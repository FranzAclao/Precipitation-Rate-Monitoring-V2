import React from "react";
import { UserMenu } from "@/components/UserMenu.jsx";

export function Header({ title = "Precipitation Rate Monitoring System" }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Monitoring Center</p>
        <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
      </div>
      <UserMenu />
    </header>
  );
}
