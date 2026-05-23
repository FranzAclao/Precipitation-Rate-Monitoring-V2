import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFloodData } from "@/hooks/useFloodData";
import { AppLoader } from "@/components/AppLoader.jsx";
import NodeMap from "@/components/map";
import { CloudRain, AlertTriangle, CheckCircle2, AlertCircle, XCircle, Activity, WifiOff, RefreshCcw } from "lucide-react";

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
    if (rain?.status === "active") items.push({ tone: "normal", text: `Rainfall status is ${rain.intensity.toLowerCase()}. Continue monitoring live telemetry.` });
    if (items.length === 0) items.push({ tone: "normal", text: "All sensor nodes are online and reporting normally." });

    return items.slice(0, 3);
  }, [node1, node2, rain]);

  const recentLogsPreview = useMemo(() => {
    return [...(allLogs || [])]
      .sort((a, b) => new Date(String(b.timestamp || "").replace(" ", "T")) - new Date(String(a.timestamp || "").replace(" ", "T")))
      .slice(0, 5);
  }, [allLogs]);

  const overallStatus = useMemo(() => {
    const labels = [node1?.label, node2?.label].map(normalizeLevelLabel);
    const top = labels.sort((a, b) => getLevelRank(b) - getLevelRank(a))[0] || "MONITORING";
    const anyOffline = node1?.status === "offline" || node2?.status === "offline";
    const tone = anyOffline ? "offline" : top;

    return {
      tone,
      label: anyOffline ? "Attention needed" : getDisplayStatusName(top),
      subtitle: anyOffline ? "One or more nodes are offline" : "Current canal status",
    };
  }, [node1, node2]);

  const monitoringSnapshot = useMemo(() => {
    const nodeStates = [
      { label: "Node 1", status: node1?.status },
      { label: "Node 2", status: node2?.status },
    ];
    const onlineCount = nodeStates.filter((item) => item.status !== "offline").length;
    const offlineCount = nodeStates.length - onlineCount;
    const rainfallState =
      rain?.status === "offline" ? "Rain sensor offline"
        : rain?.status === "active" ? `${rain?.intensity || "Rain"} rainfall`
          : "No active rainfall";

    const headline =
      offlineCount > 0 ? "Attention needed"
        : rain?.status === "active" ? "Monitoring active rainfall"
          : "System monitoring normally";

    const summary = `${onlineCount} of ${nodeStates.length} nodes online · ${rainfallState} · Last sync: ${lastUpdate}`;

    const chips = [
      {
        label: rainfallState,
        tone: rain?.status === "active" ? "watch" : rain?.status === "offline" ? "offline" : "normal",
        icon: <CloudRain className="h-3.5 w-3.5" />,
      },
      {
        label: node1?.status === "offline" ? "Node 1 Offline" : "Node 1 Active",
        tone: node1?.status === "offline" ? "offline" : "normal",
        icon: node1?.status === "offline" ? <WifiOff className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />,
      },
      {
        label: node2?.status === "offline" ? "Node 2 Offline" : "Node 2 Active",
        tone: node2?.status === "offline" ? "offline" : "normal",
        icon: node2?.status === "offline" ? <WifiOff className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />,
      },
      {
        label: `Last Sync ${lastUpdate}`,
        tone: "normal",
        icon: <RefreshCcw className="h-3.5 w-3.5" />,
      },
    ];

    return { headline, summary, chips };
  }, [node1, node2, rain, lastUpdate]);

  if (loading) {
    return <AppLoader label="Loading Overview..." />;
  }

  return (
    <div className="app-page-container">
          <div className="app-page-stack">
            <header className="app-page-header">
              <p className="app-page-copy">System overview with node locations, monitoring status, and active alerts.</p>
            </header>

            <section
              className="app-card monitoring-overview-shell monitoring-overview-link"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/dashboard")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate("/dashboard");
                }
              }}
            >
              <div className="app-section-header monitoring-overview-header">
                <div>
                  <p className="app-eyebrow">Monitoring Overview</p>
                  <h3 className="app-section-title">Monitoring Status</h3>
                </div>
              </div>

              <div className="app-subcard monitoring-overview-card px-4 py-4">
                <div className="monitoring-snapshot-shell">
                  <div className="min-w-0 flex-1">
                    <div className="monitoring-snapshot-top">
                      <div className={`ml-auto monitoring-snapshot-pill ${getOverviewStatusPillClass(overallStatus.tone)}`}>
                        {getStatusIcon(overallStatus.tone)}
                        <span>{overallStatus.label}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-current/80">{monitoringSnapshot.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {monitoringSnapshot.chips.map((chip) => (
                        <div key={chip.label} className={`overview-status-chip tone-${chip.tone}`}>
                          <span className="overview-status-chip-icon">{chip.icon}</span>
                          <span>{chip.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
              <section
                className="app-card overview-link-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/locations")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("/locations");
                  }
                }}
              >
                <div className="app-section-header">
                  <div>
                    <p className="app-eyebrow">Location Site</p>
                    <h3 className="app-section-title">Node deployment overview</h3>
                  </div>
                </div>
                <div className="rounded-3xl overflow-hidden border border-slate-300 shadow-sm">
                  <NodeMap nodes={locationPreviewNodes} heightClass="h-[260px]" />
                </div>
              </section>

              <section className="space-y-6">
                <PreviewPanel
                  eyebrow="Alerts"
                  title="Active system alerts"
                  onClick={() => navigate("/alerts")}
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
                  onClick={() => navigate("/data")}
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
  );
}

function PreviewPanel({ eyebrow, title, onClick, children }) {
  return (
    <section
      className="app-card overview-link-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="app-section-header">
        <div>
          <p className="app-eyebrow">{eyebrow}</p>
          <h3 className="app-section-title">{title}</h3>
        </div>
      </div>
      {children}
    </section>
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

function getOverviewStatusCardClass(tone) {
  const normalized = String(tone || "").toUpperCase();
  if (normalized === "OFFLINE") return "border-amber-200 bg-amber-50/80 text-amber-950";
  if (normalized === "DANGER") return "border-red-200 bg-red-50/90 text-red-950";
  if (normalized === "CAUTION") return "border-orange-200 bg-orange-50/90 text-orange-950";
  if (normalized === "WATCH") return "border-yellow-200 bg-yellow-50/90 text-amber-950";
  if (normalized === "SAFE") return "border-emerald-200 bg-emerald-50/90 text-emerald-950";
  return "border-slate-300 bg-white text-foreground";
}

function getOverviewStatusPillClass(tone) {
  const normalized = String(tone || "").toUpperCase();
  if (normalized === "OFFLINE") return "border-amber-300 bg-amber-100 text-amber-900";
  if (normalized === "DANGER") return "border-red-300 bg-red-100 text-red-900";
  if (normalized === "CAUTION") return "border-orange-300 bg-orange-100 text-orange-900";
  if (normalized === "WATCH") return "border-yellow-300 bg-yellow-100 text-amber-900";
  if (normalized === "SAFE") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  return "border-slate-300 bg-slate-100 text-slate-900";
}

function getStatusIcon(tone) {
  const normalized = String(tone || "").toUpperCase();
  if (normalized === "OFFLINE") return <XCircle className="h-4 w-4" />;
  if (normalized === "DANGER") return <AlertTriangle className="h-4 w-4" />;
  if (normalized === "CAUTION") return <AlertCircle className="h-4 w-4" />;
  if (normalized === "WATCH") return <AlertCircle className="h-4 w-4" />;
  if (normalized === "SAFE") return <CheckCircle2 className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}
