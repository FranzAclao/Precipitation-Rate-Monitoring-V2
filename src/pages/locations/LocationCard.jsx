import { CheckCircle2, XCircle } from "lucide-react";

export default function LocationCard({ node }) {
  const isOffline = node.status === "offline";

  return (
    <div className="app-card bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">{node.displayName || node.label || "Sensor Node"}</p>
          <h3 className="text-lg font-black text-foreground">{node.label || node.displayName || "Unknown Node"}</h3>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold ${isOffline ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {isOffline ? "Offline" : "Active"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Stat label="Water Level" value={node.level ?? "--"} unit="m" />
        <Stat label="Rain Rate" value={node.rainRate?.toFixed ? node.rainRate.toFixed(1) : node.rainRate ?? "--"} unit="mm/hr" />
        <Stat label="Latitude" value={node.lat?.toFixed ? node.lat.toFixed(4) : node.lat ?? "--"} />
        <Stat label="Longitude" value={node.lng?.toFixed ? node.lng.toFixed(4) : node.lng ?? "--"} />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        {isOffline ? <XCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
        <span>{node.timestamp ? `Last update: ${node.timestamp}` : "No recent update"}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400 font-semibold mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}{unit ? ` ${unit}` : ""}</p>
    </div>
  );
}
