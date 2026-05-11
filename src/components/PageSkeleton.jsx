import React from "react";

export default function PageSkeleton({ cards = 4, rows = 1, compact = false }) {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {cards > 0 && (
        <div className={`grid gap-4 ${compact ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-border bg-card" />
          ))}
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={`rounded bg-muted ${index === 0 ? "h-6 w-56" : "h-12 w-full"}`} />
        ))}
      </div>
    </div>
  );
}
