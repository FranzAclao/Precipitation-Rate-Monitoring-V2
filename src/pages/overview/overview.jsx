import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFloodData } from "@/hooks/useFloodData";
import { Header } from "@/components/Header.jsx";
import { Sidebar } from "@/components/Sidebar.jsx";
import { AppLoader } from "@/components/AppLoader.jsx";
import NodeMap from "@/components/map";
import { MapPin, Database, Bell, CloudRain, Droplets, Clock, AlertTriangle } from "lucide-react";

export default function OverviewPage() {
  const { rain, system, node1, node2, nodes, allLogs, lastUpdate, loading } = useFloodData();
  const navigate = useNavigate();

  const locationPreviewNodes = useMemo(() => {
    if (Array.isArray(nodes) && nodes.length > 0) return nodes;

    return [
      { id: "node1", displayName: "Sensor Node 1", label: node1?.label, status: node1?.status, level: node1?.level, lat: node1?.lat, lng: node1?.lng, timestamp: node1?.timestamp, rainRate: node1?.rainRate },
      { id: "node2", displayName: "Sensor Node 2", label: node2?.label, status: node2?.status, level: node2?.level, lat: node2?.lat, lng: node2?.lng, timestamp: node2?.timestamp, rainRate: node2?.rainRate },
    ].filter((node) => node.status || node.timestamp || node.lat || node.lng);
  }, [nodes, node1, node2]);

  const alertPreviewItems = useMemo(() => {
    const items = [];

    if (node1?.status === "offline") items.push({ tone: "critical", text: "Node 1 is offline. Check battery or cellular signal." });
    if (node2?.status === "offline") items.push({ tone: "warning", text: "Node 2 heartbeat is stale. Inspect connectivity." });
    if (rain?.intensity && rain.intensity !== "NO RAIN") items.push({ tone: "normal", text: `Rainfall status is ${rain.intensity.toLowerCase()}. Continue monitoring live telemetry.` });
    if (items.length === 0) items.push({ tone: "normal", text: "All sensor nodes are online and reporting normally." });

    return items.slice(0, 3);
  }, [node1, node2, rain]);

  const recentLogsPreview = useMemo(() => {
    return [...(allLogs || [])]
      .sort((a, b) => new Date(String(b.timestamp || "").replace(" ", "T")) - new Date(String(a.timestamp || "").replace(" ", "T")))
      .slice(0, 5);
  }, [allLogs]);

  const telemetryMetrics = useMemo(() => {
    const detailMap = new Map((system?.details || []).map((item) => [String(item.nodeKey || "").toLowerCase(), item]));

    const buildMetric = (nodeKey, title) => {
      const detail = detailMap.get(nodeKey);
      if (!detail) {
        return {
          title,
          value: "No telemetry",
          subtitle: "Waiting for data",
        };
      }

      return {
        title,
        value: detail.offline ? "Offline" : getTelemetryLabel(detail.sendReason),
        subtitle: detail.timestamp || "No timestamp",
      };
    };

    return [
      { title: "Rain Intensity", value: rain?.intensity || "--", subtitle: rain?.rate || "Detecting...", icon: <CloudRain className="w-5 h-5" /> },
      { title: "Accumulated Rainfall", value: rain?.total1h || "--", subtitle: "In total", icon: <Droplets className="w-5 h-5" /> },
      { ...buildMetric("node1", "Node 1 Status"), icon: <Clock className="w-5 h-5" /> },
      { ...buildMetric("node2", "Node 2 Status"), icon: <Clock className="w-5 h-5" /> },
    ];
  }, [rain, system]);

  const overallStatus = useMemo(() => {
    const labels = [node1?.label, node2?.label].map(normalizeLevelLabel);
    const top = labels.sort((a, b) => getLevelRank(b) - getLevelRank(a))[0] || "MONITORING";
    const anyOffline = node1?.status === "offline" || node2?.status === "offline";

    return {
      label: anyOffline ? "Attention needed" : getDisplayStatusName(top),
      subtitle: anyOffline ? "One or more nodes are offline" : "Current canal risk status",
    };
  }, [node1, node2]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground font-sans md:h-screen md:overflow-hidden">
        <Sidebar activeView="overview" node1={node1} node2={node2} lastUpdate={lastUpdate} />
        <main className="flex-1 overflow-y-auto bg-background px-6 pb-6 md:px-12 md:pb-10 lg:px-14 animate-in fade-in duration-500">
          <Header title="Overview" />
        <div className="app-page-container">
          <AppLoader label="Loading Overview..." />
        </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans md:h-screen md:overflow-hidden">
      <Sidebar activeView="overview" node1={node1} node2={node2} lastUpdate={lastUpdate} />

      <main className="flex-1 overflow-y-auto bg-background px-6 pb-6 md:px-12 md:pb-10 lg:px-14 animate-in fade-in duration-500">
        <Header title="Overview" />

        <div className="app-page-container">
          <div className="app-page-stack">
            <header className="app-page-header">
              <p className="app-page-copy">System overview with node locations, recent telemetry, and active alerts.</p>
            </header>

            <section className="app-card">
              <div className="app-section-header flex-col lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="app-eyebrow">Monitoring Overview</p>
                  <h3 className="app-section-title">Dashboard metrics overview</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <PreviewLink icon={<Clock size={14} />} label="Open Monitoring" onClick={() => navigate("/dashboard")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {telemetryMetrics.map((metric) => (
                  <OverviewMetricCard key={metric.title} title={metric.title} value={metric.value} subtitle={metric.subtitle} icon={metric.icon} />
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard#sensor-telemetry")}
                  className="rounded-2xl border border-[#003a5a] bg-gradient-to-b from-[#003a5a] via-[#00314d] to-[#00253b] px-4 py-4 text-center text-sm font-bold text-white shadow-md transition hover:brightness-110"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Open Sensor Telemetry</div>
                  <div className="mt-2 text-base font-black text-white">Go To Monitoring Dashboard</div>
                </button>
                <div className="app-subcard px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Overall Status</p>
                  <p className="mt-2 text-lg font-black text-foreground">{overallStatus.label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{overallStatus.subtitle}</p>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
              <section className="app-card">
                <div className="app-section-header">
                  <div>
                    <p className="app-eyebrow">Location Site</p>
                    <h3 className="app-section-title">Node deployment overview</h3>
                  </div>
                  <PreviewLink icon={<MapPin size={14} />} label="Open locations" onClick={() => navigate("/locations")} />
                </div>
                <div className="rounded-3xl overflow-hidden border border-slate-300 shadow-sm">
                  <NodeMap nodes={locationPreviewNodes} heightClass="h-[260px]" />
                </div>
              </section>

              <section className="space-y-6">
                <PreviewPanel
                  eyebrow="Alerts"
                  title="Active system alerts"
                  actionLabel="Open alerts"
                  actionIcon={<Bell size={14} />}
                  onAction={() => navigate("/alerts")}
                >
                  <div className="space-y-3">
                    {alertPreviewItems.map((item, index) => (
                      <PreviewAlert key={`${item.text}-${index}`} tone={item.tone} text={item.text} />
                    ))}
                  </div>
                </PreviewPanel>

                <PreviewPanel
                  eyebrow="Data Logs"
                  title="Recent telemetry records"
                  actionLabel="Open logs"
                  actionIcon={<Database size={14} />}
                  onAction={() => navigate("/data")}
                >
                  <div className="space-y-3">
                    {recentLogsPreview.length === 0 ? (
                      <p className="text-sm font-medium text-muted-foreground">No telemetry records available yet.</p>
                    ) : (
                      recentLogsPreview.map((log, index) => (
                        <div key={`${log.timestamp}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-foreground">{String(log.nodeKey || log.nodeId || "Node").toUpperCase()}</p>
                            <p className="truncate text-xs font-medium text-muted-foreground">{log.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{log.rain} mm/hr</p>
                            <p className="text-sm font-bold text-foreground">{log.level} cm</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PreviewPanel>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function OverviewMetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="app-subcard shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</h4>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          {icon}
        </div>
      </div>
      <div className="text-xl font-black tracking-tight text-foreground">{value}</div>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{subtitle}</p>
    </div>
  );
}

function PreviewPanel({ eyebrow, title, actionLabel, actionIcon, onAction, children }) {
  return (
    <section className="app-card">
      <div className="app-section-header">
        <div>
          <p className="app-eyebrow">{eyebrow}</p>
          <h3 className="app-section-title">{title}</h3>
        </div>
        <PreviewLink icon={actionIcon} label={actionLabel} onClick={onAction} />
      </div>
      {children}
    </section>
  );
}

function PreviewLink({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="app-action-button"
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewAlert({ tone, text }) {
  const toneClass = tone === "critical"
    ? "border-red-200 bg-red-50 text-red-700"
    : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-white/90 text-slate-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-bold shadow-md ${toneClass}`}>
      {text}
    </div>
  );
}

function getTelemetryLabel(reason) {
  if (reason === "heartbeat_boot") return "System started";
  if (reason === "heartbeat_dry") return "Dry conditions";
  if (reason === "rain_event") return "Rain started";
  if (reason === "periodic_wet") return "Rain ongoing";
  if (reason === "periodic_dry_window") return "Post-rain monitoring";
  return "Telemetry live";
}

function normalizeLevelLabel(label) {
  const normalized = String(label || "MONITORING").trim().toUpperCase();
  if (normalized === "WARNING") return "CAUTION";
  if (["SAFE", "WATCH", "CAUTION", "DANGER", "MONITORING"].includes(normalized)) return normalized;
  return "MONITORING";
}

function getLevelRank(label) {
  const normalized = normalizeLevelLabel(label);
  if (normalized === "DANGER") return 4;
  if (normalized === "CAUTION") return 3;
  if (normalized === "WATCH") return 2;
  if (normalized === "SAFE") return 1;
  return 0;
}

function getDisplayStatusName(label) {
  const normalized = normalizeLevelLabel(label);
  if (normalized === "DANGER") return "Flood Risk";
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}
