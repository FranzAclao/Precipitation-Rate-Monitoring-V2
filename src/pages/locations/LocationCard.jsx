import { CheckCircle2, XCircle, MapPin } from "lucide-react";

export default function LocationCard({ node }) {
  const isOffline = node.status === "offline";
  const locationIconColor = isOffline ? "text-red-500" : "text-blue-500";

  return (
    <div className="app-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">{node.displayName || node.label || "Sensor Node"}</p>
          <h3 className="text-lg font-black text-foreground">{node.label || node.displayName || "Unknown Node"}</h3>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold ${isOffline ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"}`}>
          {isOffline ? "Offline" : "Active"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Stat label="Water Level" value={node.level ?? "--"} unit="m" />
        <Stat label="Rain Rate" value={node.rainRate?.toFixed ? node.rainRate.toFixed(1) : node.rainRate ?? "--"} unit="mm/hr" />
        <StatWithIcon label="Latitude" value={node.lat?.toFixed ? node.lat.toFixed(4) : node.lat ?? "--"} icon={<MapPin size={16} className={locationIconColor} />} />
        <StatWithIcon label="Longitude" value={node.lng?.toFixed ? node.lng.toFixed(4) : node.lng ?? "--"} icon={<MapPin size={16} className={locationIconColor} />} />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        {isOffline ? <XCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-blue-500" />}
        <span>{node.timestamp ? `Last update: ${node.timestamp}` : "No recent update"}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400 font-semibold mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}{unit ? ` ${unit}` : ""}</p>
    </div>
  );
}

function StatWithIcon({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400 font-semibold">{label}</p>
      </div>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
