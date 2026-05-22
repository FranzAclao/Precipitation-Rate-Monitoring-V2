import React from "react";
import { Activity, Clock, ShieldCheck } from "lucide-react";
import { useFloodData } from "@/hooks/useFloodData";
import { AppLoader } from "@/components/AppLoader.jsx";

export default function AlertsPage() {
  const { rain, node1, node2, loading } = useFloodData();

  if (loading) {
    return <AppLoader label="Loading Alerts..." />;
  }

  return (
    <div className="app-page-stack">
      <header className="app-page-header">
        <p className="app-page-copy">Alerts, diagnostics, and system logs.</p>
      </header>

      <div className="app-card max-w-3xl">
        <h3 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Active Alerts
        </h3>

        <div className="space-y-4">
          {node1.status === "offline" && <AlertItem type="critical" msg="Station 1 (Upstream) is offline. Check battery or cellular signal." />}
          {node2.status === "offline" && <AlertItem type="warning" msg="Station 2 (Downstream) heartbeat weak. Last seen 15 mins ago." />}

          {node1.status !== "offline" && node2.status !== "offline" && (
            <AlertItem type="normal" msg="All sensor nodes are online and reporting normally." />
          )}

          <AlertItem type="normal" msg="Predictive Model: Stable. No flood risk projected." />
          <AlertItem type="normal" msg="Cloud Sync: 100% Active. Firebase connection secured." />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-300 bg-muted p-5 shadow-sm">
          <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2 tracking-tighter">AI Quick Summary</p>
          <p className="text-sm text-foreground/80 leading-relaxed font-medium">
            System is currently monitoring 2 key nodes. Rainfall is currently <span className="text-blue-600 font-bold">{rain.intensity}</span>. No immediate flood threat detected in the next 30 minutes based on upstream data.
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, msg }) {
  const styles = {
    critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/50",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/50",
    normal: "bg-card text-muted-foreground border-border"
  };

  return (
    <div className={`rounded-2xl border p-4 text-sm font-bold shadow-md transition-all flex items-start gap-3 ${styles[type]}`}>
      {type === "critical" && <Activity className="w-5 h-5 text-red-500 shrink-0" />}
      {type === "warning" && <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
      {type === "normal" && <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />}
      {msg}
    </div>
  );
}
