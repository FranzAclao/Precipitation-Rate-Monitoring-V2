import React, { useState } from "react";
import { Bell, AlertCircle, Clock } from "lucide-react";
import { Activity, ShieldCheck } from "lucide-react";

/**
 * NotificationButton - Shows alerts dropdown in the header
 * Displays notification icon with badge if alerts exist
 */
export function NotificationButton({ node1, node2 }) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine if there are active alerts
  const hasAlerts = node1?.status === "offline" || node2?.status === "offline";
  const alertCount = (node1?.status === "offline" ? 1 : 0) + (node2?.status === "offline" ? 1 : 0);

  const alerts = [];
  if (node1?.status === "offline") {
    alerts.push({
      type: "critical",
      icon: Activity,
      msg: "Station 1 (Upstream) is offline. Check battery or cellular signal.",
    });
  }
  if (node2?.status === "offline") {
    alerts.push({
      type: "warning",
      icon: Clock,
      msg: "Station 2 (Downstream) heartbeat weak. Last seen 15 mins ago.",
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell size={20} className="text-slate-700" />
        {hasAlerts && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold shadow-lg animate-pulse">
            {alertCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Alerts & Notifications
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={32} className="text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-600">No alerts</p>
                <p className="text-xs text-slate-400 mt-1">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {alerts.map((alert, idx) => {
                  const Icon = alert.icon;
                  const bgColor =
                    alert.type === "critical"
                      ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
                      : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50";
                  const textColor =
                    alert.type === "critical"
                      ? "text-red-700 dark:text-red-200"
                      : "text-amber-700 dark:text-amber-200";
                  const iconColor =
                    alert.type === "critical" ? "text-red-500" : "text-amber-500";

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 text-sm font-medium shadow-sm transition-all flex items-start gap-3 ${bgColor} ${textColor}`}
                    >
                      <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
                      <p>{alert.msg}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
