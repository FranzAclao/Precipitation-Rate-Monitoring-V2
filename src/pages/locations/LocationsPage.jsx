import React, { useMemo } from "react";
import { useFloodData } from "@/hooks/useFloodData";
import Map from "@/components/map";
import { AppLoader } from "@/components/AppLoader.jsx";
import LocationCard from "./LocationCard";
import { MapPin, Droplet, Clock, Signal } from "lucide-react";

export default function LocationsPage() {
  const { nodes, node1, node2, lastUpdate, loading } = useFloodData();

  const locationNodes = useMemo(() => {
    if (Array.isArray(nodes) && nodes.length > 0) {
      return nodes;
    }

    return [node1, node2].filter(Boolean).map((node, index) => ({
      id: `node-${index + 1}`,
      displayName: node.label || `Sensor Node ${index + 1}`,
      label: node.label || `Node ${index + 1}`,
      status: node.status || "offline",
      level: node.level,
      lat: node.lat,
      lng: node.lng,
      timestamp: node.timestamp,
      rainRate: node.rainRate,
    }));
  }, [nodes, node1, node2]);

  const statusSummary = useMemo(() => {
    const total = locationNodes.length;
    const active = locationNodes.filter((node) => node.status !== "offline").length;
    const offline = total - active;
    return { total, active, offline };
  }, [locationNodes]);

  if (loading) {
    return <AppLoader label="Loading Sensor Nodes..." />;
  }

  return (
    <div className="app-page-stack">
      <header className="app-page-header">
        <p className="app-page-copy">Sensor nodes deployed in the field, shown with status, coordinates, and water levels.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="app-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Overview</p>
                <h3 className="text-xl font-black text-foreground mt-2">Node deployment</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <SummaryTile label="Sensors" value={statusSummary.total} icon={<MapPin size={16} />} />
                <SummaryTile label="Active" value={statusSummary.active} icon={<Signal size={16} />} />
                <SummaryTile label="Offline" value={statusSummary.offline} icon={<Clock size={16} />} />
              </div>
            </div>
            <div className="mt-6 rounded-3xl overflow-hidden border border-slate-300 shadow-sm">
              <Map nodes={locationNodes} />
            </div>
          </div>

          <div className="grid gap-4">
            {locationNodes.map((node) => (
              <LocationCard key={node.id} node={node} />
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="app-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-3">Spatial insight</p>
            <p className="text-sm leading-6 text-muted-foreground">
              This view displays deployed sensor nodes with their reported location, and connectivity status. 
            </p>
          </div>

          <div className="app-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Last sync</p>
            <div className="app-subcard rounded-3xl text-sm font-semibold text-foreground">
              {lastUpdate}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, icon }) {
  return (
    <div className="app-subcard rounded-3xl px-4 py-3 shadow-md flex items-center gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-semibold">{label}</p>
        <p className="text-xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}
