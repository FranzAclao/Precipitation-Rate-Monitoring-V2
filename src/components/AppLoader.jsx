import React from "react";
import { RefreshCcw } from "lucide-react";

export function AppLoader({ label = "Syncing with Sensors...", className = "" }) {
  return (
    <div className={`flex h-full min-h-[320px] flex-col items-center justify-center bg-background text-muted-foreground font-medium ${className}`}>
      <div className="relative flex h-12 w-12 mb-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-12 w-12 bg-blue-500 items-center justify-center">
          <RefreshCcw className="text-white animate-spin-slow" size={24} />
        </span>
      </div>
      <p className="tracking-widest text-xs font-bold uppercase">{label}</p>
    </div>
  );
}
