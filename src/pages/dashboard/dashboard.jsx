import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFloodData } from "@/hooks/useFloodData";
import RainfallChart from "@/components/RainfallChart";
import DataLogs from "@/pages/datalogs/data";
import AnalysisPage from "@/pages/analysis/analysis";
import AlertsPage from "@/pages/alerts/alerts.jsx";
import { 
  CloudRain, Waves, Activity, Clock, Droplets, Calendar, AlertTriangle, Eye, Check, CircleAlert,
  RefreshCcw, CheckCircle2, AlertCircle, XCircle, CircleHelp
} from "lucide-react";
import { AppLoader } from "@/components/AppLoader.jsx";
import LocationsPage from "@/pages/locations/LocationsPage.jsx";
import SettingsPage from "@/pages/settings/settings.jsx";
import CanalSvg from "@/components/CanalSvg.jsx";
import "./dashboard.css";

const LEVEL_META = {
  SAFE: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    solid: "border-emerald-500 bg-emerald-500 text-white",
    water: "from-emerald-200 via-emerald-300 to-emerald-400",
    surface: "#bbf7d0",
    marker: "bg-emerald-500",
    darkPill: "border-emerald-500/30 bg-emerald-500/12 text-emerald-200",
  },
  WATCH: {
    pill: "border-yellow-200 bg-yellow-50 text-amber-700",
    solid: "border-yellow-400 bg-yellow-400 text-slate-950",
    water: "from-yellow-200 via-yellow-300 to-amber-300",
    surface: "#fde68a",
    marker: "bg-amber-400",
    darkPill: "border-amber-400/30 bg-amber-400/16 text-amber-100",
  },
  CAUTION: {
    pill: "border-orange-200 bg-orange-50 text-orange-700",
    solid: "border-orange-500 bg-orange-500 text-white",
    water: "from-orange-200 via-orange-300 to-orange-400",
    surface: "#fdba74",
    marker: "bg-orange-500",
    darkPill: "border-orange-500/30 bg-orange-500/16 text-orange-100",
  },
  DANGER: {
    pill: "border-red-200 bg-red-50 text-red-700",
    solid: "border-red-500 bg-red-500 text-white",
    water: "from-red-200 via-red-300 to-red-400",
    surface: "#fca5a5",
    marker: "bg-red-500",
    darkPill: "border-red-500/32 bg-red-500/18 text-red-100",
  },
  MONITORING: {
    pill: "border-slate-200 bg-slate-50 text-slate-700",
    solid: "border-slate-400 bg-slate-400 text-white",
    water: "from-sky-200 via-sky-300 to-sky-400",
    surface: "#bae6fd",
    marker: "bg-slate-400",
    darkPill: "border-slate-500/28 bg-slate-500/14 text-slate-200",
  },
};

function formatLocalDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTelemetryLabel(reason) {
  if (reason === "heartbeat_boot") return "System started";
  if (reason === "heartbeat_dry") return "Dry conditions";
  if (reason === "rain_event") return "Rain started";
  if (reason === "periodic_wet") return "Rain ongoing";
  if (reason === "periodic_dry_window") return "Post-rain monitoring";
  return "Telemetry live";
}

export default function Dashboard() {
  const { rain, system, node1, node2, allLogs, lastUpdate, loading } = useFloodData();
  const location = useLocation();

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const routeToView = useMemo(() => ({
    "/": "overview",
    "/dashboard": "dashboard",
    "/geospatial-status": "locations",
    "/locations": "locations",
    "/data": "data",
    "/analysis": "analysis",
    "/alerts": "alerts",
    "/settings": "settings",
  }), []);
  const activeView = routeToView[location.pathname] || "dashboard";
  const viewTitles = useMemo(() => ({
    dashboard: "Monitoring Dashboard",
    locations: "Sensor Nodes",
    data: "Data Logs",
    analysis: "ML Analysis",
    alerts: "Alerts",
    settings: "Settings",
  }), []);

  const chartData = useMemo(() => {
    if (!allLogs || allLogs.length === 0) return [];
    return allLogs.filter(log => log.fullDate === selectedDate);
  }, [selectedDate, allLogs]);
  const sectionRisk = useMemo(() => getSectionRisk(node1, node2), [node1, node2]);

  const telemetryMetrics = useMemo(() => {
    const detailMap = new Map((system?.details || []).map((item) => [String(item.nodeKey || "").toLowerCase(), item]));

    const buildMetric = (nodeKey, title) => {
      if (selectedDate !== todayStr) {
        return {
          title,
          value: "ARCHIVE",
          badge: "Historical view",
          badgeTone: "neutral",
        };
      }

      const detail = detailMap.get(nodeKey);
      if (!detail) {
        return {
          title,
          value: "No telemetry",
          badge: "Waiting for data",
          badgeTone: "neutral",
          status: "offline",
        };
      }

      return {
        title,
        value: detail.offline ? "Offline" : getTelemetryLabel(detail.sendReason),
        badge: formatMetricTimestamp(detail.timestamp, { offline: detail.offline }),
        badgeTone: detail.offline ? "offline" : "neutral",
        status: detail.offline ? "offline" : undefined,
      };
    };

    return [
      buildMetric("node1", "Node 1 Status"),
      buildMetric("node2", "Node 2 Status"),
    ];
  }, [selectedDate, todayStr, system]);

  useEffect(() => {
    if (location.hash !== "#sensor-telemetry") return;
    const timeoutId = window.setTimeout(() => {
      document.getElementById("sensor-telemetry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 220);
    return () => window.clearTimeout(timeoutId);
  }, [location.hash, activeView]);

  if (loading) return (
    <AppLoader label="Syncing with Sensors..." />
  );

  return (
    <div className="app-page-container">
          <>
        {activeView === 'dashboard' && (
          <div className="app-page-stack">
            <header className="app-page-header">
              <p className="app-page-copy">Real-time metrics and historical rainfall data.</p>
            </header>

            <div className="monitoring-metric-grid">
              <MetricCard
                title="Rain Intensity"
                value={rain.status === "offline" ? "Offline" : rain.intensity}
                badge={rain.status === "offline" ? "Sensor state unavailable" : `${rain.rate}`}
                badgeTone={rain.status === "active" ? "watch" : rain.status === "offline" ? "offline" : "neutral"}
                icon={<CloudRain className="w-5 h-5" />}
                darkTheme
                status={rain.status === "offline" ? "offline" : undefined}
                showRainfallAnimation
                rainfallIntensity={rain.intensity}
              />
              <MetricCard
                title="Accumulated Rainfall"
                value={rain.total1h}
                badge={rain.status === "active" ? "Current rainfall event" : rain.status === "offline" ? "Sensor offline" : "No active rainfall"}
                badgeTone={rain.status === "active" ? "watch" : rain.status === "offline" ? "offline" : "neutral"}
                icon={<Droplets className="w-5 h-5" />}
                darkTheme
                status={rain.status === "offline" ? "offline" : undefined}
              />
              {telemetryMetrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  badge={metric.badge}
                  badgeTone={metric.badgeTone}
                  icon={<Clock className="w-5 h-5" />}
                  darkTheme
                  status={metric.status}
                />
              ))}
              <MetricCard
                title="Overall Status"
                value={getDisplayStatusName(sectionRisk)}
                badge={getSectionLastUpdated(node1, node2)}
                badgeTone={String(sectionRisk || "").toLowerCase()}
                icon={getStatusIcon(sectionRisk)}
                solidStatusLevel={sectionRisk}
                className="monitoring-metric-card-span"
              />
            </div>

            <div id="sensor-telemetry" className="app-card p-4 sm:p-6 relative overflow-hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Rainfall Trends</h3>
                
                <div className="flex flex-wrap items-center gap-2">
                   {selectedDate !== todayStr && (
                     <button 
                      onClick={() => setSelectedDate(todayStr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all border border-blue-100"
                     >
                       <RefreshCcw size={12} className="animate-spin-hover" />
                       LIVE DATA
                     </button>
                   )}
                   <div 
                     className="flex min-w-0 items-center gap-2 border border-border bg-muted rounded-lg px-3 py-1.5 cursor-pointer hover:border-brand-teal transition-all shadow-sm"
                     onClick={() => document.getElementById('thesis-date-picker')?.showPicker()}
                   >
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <input 
                         id="thesis-date-picker"
                         type="date" 
                         value={selectedDate}
                         onChange={(e) => setSelectedDate(e.target.value)}
                         className="min-w-0 text-[11px] font-bold text-foreground bg-transparent outline-none cursor-pointer uppercase"
                      />
                   </div>
                </div>
              </div>
              <RainfallChart data={chartData} />
            </div>

            <WaterLevelSection node1={node1} node2={node2} lastUpdate={lastUpdate} />
          </div>
        )}

        {activeView === 'locations' && <LocationsPage />}

        {activeView === 'alerts' && <AlertsPage />}

        {activeView === 'data' && <DataLogs />}

        {activeView === 'analysis' && <AnalysisPage />}

        {activeView === 'settings' && <SettingsPage />}
          </>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
        isActive
          ? 'border-brand-teal/30 text-yellow-400 shadow-sm border'
          : 'text-slate-300 hover:bg-white/5 hover:text-yellow-400 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-slate-400 group-hover:text-yellow-400'}`}>
          {icon}
        </span>
        {label}
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          {badge}
        </span>
      )}
    </button>
  );
}

function WaterLevelSection({ node1, node2 }) {
  const nodes = [
    { key: "node1", title: "Zone 1", node: node1 },
    { key: "node2", title: "Zone 5", node: node2 },
  ];
  const sectionRisk = getSectionRisk(node1, node2);

  return (
    <section className="water-level-section">
      <div className="space-y-4">
        <div className="water-level-top-shell">
          <div className="water-level-header">
            <div>
              <h2 className="water-level-heading text-xl font-black tracking-tight md:text-2xl">Water Level Overview</h2>
              <p className="water-level-subtitle">Monitor canal water level.</p>
              <div className="water-level-status-row">
              </div>
            </div>
            <WaterLevelGuideHelp activeLevel={sectionRisk} />
          </div>
          <div className="water-level-summary-grid">
            {nodes.map((item) => (
              <NodeSummaryCard key={item.key} nodeKey={item.key} title={item.title} node={item.node} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, icon, status, badge = null, badgeTone = "neutral", darkTheme = false, solidStatusLevel = null, showRainfallAnimation = false, rainfallIntensity = null, className = "" }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOffline = status === 'offline';
  const solidStatusCard = solidStatusLevel ? getOverallStatusMetricCardClass(solidStatusLevel) : null;
  
  return (
    <div 
      className={`relative app-subcard metric-card group overflow-hidden ${className} ${
        solidStatusCard
          ? `${solidStatusCard.card} metric-card-status`
          : isOffline 
          ? darkTheme
            ? 'metric-card-offline dark:text-slate-300'
            : 'metric-card-offline bg-muted/60 border-border text-card-foreground'
          : darkTheme
            ? 'text-foreground dark:bg-[linear-gradient(180deg,rgba(24,35,51,0.92),rgba(19,29,43,0.92))]'
            : 'bg-card text-card-foreground border-border'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showRainfallAnimation && <RainfallAnimation isActive={isHovered} intensity={rainfallIntensity} />}
      
      <div className="metric-card-header">
        <h3 className={`metric-card-label ${
          solidStatusCard
            ? solidStatusCard.eyebrow
            : darkTheme ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'
        }`}>
          {title}
        </h3>
        
        <div className={`metric-card-icon ${
          solidStatusCard
            ? solidStatusCard.icon
            : isOffline 
            ? darkTheme
              ? 'bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-400'
              : 'bg-muted text-muted-foreground'
            : darkTheme
              ? 'bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-slate-200'
              : 'bg-brand-teal/10 text-brand-teal'
        }`}>
          {icon}
        </div>
      </div>
      
      <div className="metric-card-body">
        <div className={`metric-card-value ${
          solidStatusCard
            ? solidStatusCard.value
            : isOffline
            ? darkTheme ? 'text-slate-600 dark:text-slate-300' : 'text-muted-foreground'
            : 'text-foreground'
        }`}>
          {value}
        </div>
        <div className="metric-card-meta">
          {badge || isOffline ? (
            <span className={`metric-card-badge ${getMetricCardBadgeClass(isOffline ? "offline" : badgeTone, solidStatusCard)}`}>
              {badge || "Offline"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NodeSummaryCard({ nodeKey, title, node }) {
  const status = getNodeStatus(node);
  const trend = getNodeTrend(node);
  const isOffline = node?.status === "offline";
  const iconTone = getNodeIconTone(status, isOffline);
  const canalStatus = getCanalStatusValue(status);
  const thresholdLevel = getCanalThresholdLevel(nodeKey, node);
  const delta = getCanalThresholdDelta(node, thresholdLevel);
  const deltaLabel = getCanalDeltaLabel(delta, getNodeUnit(node));
  const deltaMetricLabel = delta !== null && delta < 0 ? "Water Level Below Threshold" : "Water Level Above Threshold";

  return (
    <div className="relative app-subcard bg-card text-card-foreground p-4 transition-all duration-300 flex flex-col min-h-[176px] group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="water-level-node-title">{title}</p>
          <p className="water-level-value-label">Current water level</p>
          <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">{formatNodeLevel(node)}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${iconTone}`}>
            <Waves className="w-5 h-5" />
          </div>
          {status.hasData && delta !== null && delta > 0 && (
            <div className="water-level-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Water level exceeded {thresholdLevel} {getNodeUnit(node)}
            </div>
          )}
        </div>
      </div>
      <div className="water-level-mini-grid">
        <NodeMiniStat label="Level Status" value={status.badge} tone={status.meta.text} />
        <NodeMiniStat label="Trend" value={trend.value} tone={trend.tone} />
        <NodeMiniStat label="Last Updated" value={formatNodeTime(node?.timestamp)} />
      </div>
      <div className="mt-4">
        <div className="water-level-visual">
          <CanalSvg
            level={node?.level}
            maxLevel={node?.maxLevel}
            status={canalStatus}
            hasData={status.hasData}
            thresholdLevel={thresholdLevel}
          />
        </div>
        <div className="canal-metric-grid">
          <div className="canal-metric-card">
            <p className="canal-metric-label">Current Water Level</p>
            <p className="canal-metric-value">{status.hasData ? formatNodeLevel(node) : "--"}</p>
          </div>
          <div className="canal-metric-card">
            <p className="canal-metric-label">Threshold</p>
            <p className="canal-metric-value">{status.hasData ? `${thresholdLevel} ${getNodeUnit(node)}` : "--"}</p>
          </div>
          <div className="canal-metric-card">
            <p className="canal-metric-label">{deltaMetricLabel}</p>
            <p className={`canal-metric-value ${delta !== null && delta >= 0 ? "canal-metric-value-alert" : ""}`}>{status.hasData ? deltaLabel : "--"}</p>
          </div>
        </div>
        <p className="water-level-note">
          {status.hasData ? getCanalSummaryMessage(status.normalized, delta, getNodeUnit(node)) : "Awaiting telemetry from this monitoring node."}
        </p>
      </div>
    </div>
  );
}

function NodeMiniStat({ label, value, tone = "text-foreground" }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-sm font-black tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

function WaterLevelGuideHelp({ activeLevel }) {
  const levels = [
    {
      key: "SAFE",
      label: "Safe",
      description: "Normal water level",
      tone: "safe",
      icon: Check,
      threshold: "< 20 cm",
    },
    {
      key: "WATCH",
      label: "Watch",
      description: "Monitor closely",
      tone: "watch",
      icon: Eye,
      threshold: "20-35 cm",
    },
    {
      key: "CAUTION",
      label: "Caution",
      description: "Elevated level",
      tone: "caution",
      icon: CircleAlert,
      threshold: "36-49 cm",
    },
    {
      key: "DANGER",
      label: "Flood Risk",
      description: "Possible overflow",
      tone: "danger",
      icon: AlertTriangle,
      thresholdLines: ["Node 1 ≥ 50 cm", "Node 2 ≥ 55 cm"],
    },
  ];

  return (
    <div className="water-level-help">
      <button type="button" className="water-level-help-button" aria-label="Water level status guide">
        <CircleHelp className="h-4 w-4" />
      </button>
      <div className="water-level-help-popover">
        <p className="water-level-help-title">Water Level Status Guide</p>
        <p className="water-level-help-subtitle">Thresholds used to classify canal water level.</p>
        <div className="water-level-help-list">
        {levels.map((level) => {
          const isActive = normalizeLevelLabel(activeLevel) === level.key;
          const Icon = level.icon;
          return (
            <div
              key={level.key}
              className={`water-level-help-item tone-${level.tone} ${isActive ? "is-active" : ""}`}
            >
              <div className="water-level-help-copy">
                <div className="water-level-help-head">
                  <div className="water-level-help-top">
                    <span className="water-level-help-icon">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="water-level-help-label">{level.label}</p>
                  </div>
                  {isActive && <span className="water-level-help-current">Current</span>}
                </div>
                <div className="water-level-help-body">
                  {level.thresholdLines ? (
                    <div className="water-level-help-threshold-stack">
                      {level.thresholdLines.map((line) => (
                        <p key={line} className="water-level-help-threshold">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="water-level-help-threshold">{level.threshold}</p>
                  )}
                  <p className="water-level-help-description">{level.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function toLevelNumber(level) {
  const value = Number.parseFloat(level);
  return Number.isFinite(value) ? value : null;
}

function getNodeUnit(node) {
  const maxLevel = toLevelNumber(node?.maxLevel);
  return maxLevel && maxLevel > 10 ? "cm" : "m";
}

function formatNodeLevel(node) {
  if (node?.status === "offline") return "NO DATA";
  return formatDepth(node?.level, getNodeUnit(node));
}

function getNodeTrend(node) {
  if (node?.status === "offline") {
    return { value: "No live data", tone: "text-muted-foreground" };
  }

  const fillRatio = toLevelNumber(node?.fillRatio);
  if (fillRatio === null) return { value: "Stable", tone: "text-slate-600" };
  if (fillRatio >= 0.85) return { value: "Rising", tone: "text-red-600" };
  if (fillRatio >= 0.65) return { value: "Rising", tone: "text-orange-600" };
  if (fillRatio >= 0.4) return { value: "Stable", tone: "text-amber-600" };
  return { value: "Stable", tone: "text-emerald-600" };
}

function getNodeStatus(node) {
  const hasData = node?.status !== "offline" && toLevelNumber(node?.level) !== null;
  const normalized = hasData ? normalizeLevelLabel(node?.label) : "MONITORING";
  const badge = hasData ? getDisplayStatusName(normalized) : "NO DATA";
  const label = hasData ? `${getDisplayStatusName(normalized)} status` : "No data";

  return {
    hasData,
    normalized,
    badge,
    label,
    meta: hasData ? getLevelMeta(normalized) : {
      pill: "border-slate-200 bg-slate-50 text-slate-600",
      solid: "border-slate-400 bg-slate-400 text-white",
      water: "from-slate-200 via-slate-200 to-slate-300",
      surface: "#e5e7eb",
      marker: "bg-slate-400",
      text: "text-slate-600",
    },
  };
}

function getCanalStatusValue(status) {
  if (!status?.hasData) return "no-data";
  if (status.normalized === "DANGER") return "flood-risk";
  if (status.normalized === "CAUTION") return "caution";
  if (status.normalized === "WATCH") return "watch";
  if (status.normalized === "SAFE") return "safe";
  return "no-data";
}

function formatNodeTime(timestamp) {
  if (!timestamp) return "--:--:--";
  const value = new Date(String(timestamp).replace(" ", "T"));
  if (Number.isNaN(value.getTime())) return "--:--:--";
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatMetricTimestamp(timestamp, { offline = false } = {}) {
  const value = parseTimestampValue(timestamp);
  const prefix = offline ? "Last active" : "Updated";
  if (!value) return `${prefix} --:--`;

  const diffMinutes = Math.round((Date.now() - value.getTime()) / 60000);
  if (diffMinutes >= 0 && diffMinutes < 60) {
    return `${prefix} ${diffMinutes}m ago`;
  }

  return `${prefix} ${value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

function parseTimestampValue(timestamp) {
  if (!timestamp) return null;
  const value = timestamp instanceof Date
    ? new Date(timestamp.getTime())
    : new Date(String(timestamp).replace(" ", "T"));
  if (Number.isNaN(value.getTime())) return null;
  return value;
}

function formatDepth(value, unit) {
  const numeric = toLevelNumber(value);
  if (numeric === null) return "--";
  return `${numeric.toFixed(2)} ${unit}`;
}

function getCanalThresholdLevel(nodeKey, node) {
  const unit = getNodeUnit(node);
  if (unit === "m") return nodeKey === "node2" ? 0.55 : 0.5;
  return nodeKey === "node2" ? 55 : 50;
}

function getCanalThresholdDelta(node, thresholdLevel) {
  const level = toLevelNumber(node?.level);
  if (level === null || node?.status === "offline") return null;
  return level - thresholdLevel;
}

function getCanalDeltaLabel(delta, unit) {
  if (delta === null) return "--";
  const prefix = delta >= 0 ? "+" : "-";
  return `${prefix}${Math.abs(delta).toFixed(2)} ${unit}`;
}

function normalizeLevelLabel(label) {
  const normalized = String(label || "MONITORING").trim().toUpperCase();
  if (normalized === "WARNING") return "CAUTION";
  if (LEVEL_META[normalized]) return normalized;
  return "MONITORING";
}

function formatLevelName(label) {
  const normalized = normalizeLevelLabel(label);
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}

function getDisplayStatusName(label) {
  const normalized = normalizeLevelLabel(label);
  if (normalized === "DANGER") return "Flood Risk";
  return formatLevelName(normalized);
}

function getLevelMeta(label) {
  const meta = LEVEL_META[normalizeLevelLabel(label)] || LEVEL_META.MONITORING;
  if (meta.text) return meta;
  return {
    ...meta,
    text:
      normalizeLevelLabel(label) === "DANGER" ? "text-red-700"
        : normalizeLevelLabel(label) === "CAUTION" ? "text-orange-700"
          : normalizeLevelLabel(label) === "WATCH" ? "text-amber-700"
            : normalizeLevelLabel(label) === "SAFE" ? "text-emerald-700"
              : "text-slate-700",
  };
}

function getLevelRank(label) {
  const normalized = normalizeLevelLabel(label);
  if (normalized === "DANGER") return 4;
  if (normalized === "CAUTION") return 3;
  if (normalized === "WATCH") return 2;
  if (normalized === "SAFE") return 1;
  return 0;
}

function getSectionRisk(node1, node2) {
  const labels = [normalizeLevelLabel(node1?.label), normalizeLevelLabel(node2?.label)];
  return labels.sort((a, b) => getLevelRank(b) - getLevelRank(a))[0] || "MONITORING";
}

function isAboveWaterLevelLimit(node) {
  const level = toLevelNumber(node?.level);
  const unit = getNodeUnit(node);
  if (level === null || node?.status === "offline") return false;
  if (unit !== "cm") return false;
  return level > 55;
}

function getNodeIconTone(status, isOffline) {
  if (isOffline) return "bg-muted text-muted-foreground";
  if (status?.normalized === "DANGER") return "bg-red-500 text-white";
  if (status?.normalized === "CAUTION") return "bg-orange-500 text-white";
  if (status?.normalized === "WATCH") return "bg-yellow-400 text-slate-950";
  if (status?.normalized === "SAFE") return "bg-emerald-500 text-white";
  return "bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white";
}

function getSectionLastUpdated(node1, node2) {
  const dates = [node1?.timestamp, node2?.timestamp]
    .map((value) => parseTimestampValue(value))
    .filter(Boolean)
    .sort((a, b) => b - a);
  return formatMetricTimestamp(dates[0]);
}

function getGuideMaxLevel(node1, node2) {
  const levels = [toLevelNumber(node1?.maxLevel), toLevelNumber(node2?.maxLevel)].filter((value) => value && value > 0);
  return levels.length ? Math.max(...levels) : null;
}

function getGuideThresholdText(label, maxLevel) {
  if (label === "SAFE") return `< 20 cm`;
  if (label === "WATCH") return `20-35 cm`;
  if (label === "CAUTION") return `36-49 cm`;
  if (label === "DANGER") return `Node 1 >= 50 cm | Node 2 >= 55 cm`;
  return "Threshold pending";
}

function getStatusDescription(status) {
  if (status === "flood-risk") return "Water level is above the flood-risk threshold.";
  if (status === "caution") return "Water level is elevated and should be watched closely.";
  if (status === "watch") return "Water level is within the watch range.";
  if (status === "safe") return "Water level is within the normal operating range.";
  return "Awaiting telemetry from this monitoring node.";
}

function getCanalSummaryMessage(level, delta, unit) {
  if (delta === null) return "Awaiting telemetry from this monitoring node.";
  const amount = `${Math.abs(delta).toFixed(2)} ${unit}`;
  if (delta > 0) return `${getDisplayStatusName(level)} · Water level exceeds the threshold by ${amount}.`;
  if (delta < 0) return `${getDisplayStatusName(level)} · Water level is below the threshold by ${amount}.`;
  return `${getDisplayStatusName(level)} · Water level is at the flood threshold.`;
}

function getOverallStatusMetricCardClass(level) {
  const normalized = normalizeLevelLabel(level);
  if (normalized === "DANGER") return {
    card: "border-red-200 bg-red-50 text-red-950 shadow-[0_12px_26px_rgba(185,28,28,0.12)] dark:border-red-500/28 dark:bg-red-500/14 dark:text-red-50",
    eyebrow: "text-red-700 dark:text-red-100",
    icon: "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/22 dark:bg-red-500/16 dark:text-red-100",
    value: "text-red-950 dark:text-red-50",
    subtitle: "text-red-700 dark:text-red-100",
  };
  if (normalized === "CAUTION") return {
    card: "border-amber-200 bg-amber-50 text-amber-950 shadow-[0_12px_26px_rgba(217,119,6,0.1)] dark:border-amber-500/28 dark:bg-amber-500/14 dark:text-amber-50",
    eyebrow: "text-amber-700 dark:text-amber-100",
    icon: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/22 dark:bg-amber-500/16 dark:text-amber-100",
    value: "text-amber-950 dark:text-amber-50",
    subtitle: "text-amber-700 dark:text-amber-100",
  };
  if (normalized === "WATCH") return {
    card: "border-amber-200 bg-amber-50 text-amber-950 shadow-[0_12px_26px_rgba(217,119,6,0.08)] dark:border-amber-400/28 dark:bg-amber-400/14 dark:text-amber-50",
    eyebrow: "text-amber-700 dark:text-amber-100",
    icon: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/22 dark:bg-amber-400/16 dark:text-amber-100",
    value: "text-amber-950 dark:text-amber-50",
    subtitle: "text-amber-700 dark:text-amber-100",
  };
  if (normalized === "SAFE") return {
    card: "border-slate-200 bg-white/90 text-slate-950 shadow-[0_12px_26px_rgba(15,23,42,0.08)] dark:border-slate-500/24 dark:bg-white/8 dark:text-slate-50",
    eyebrow: "text-slate-600 dark:text-slate-100",
    icon: "border border-slate-200 bg-white/90 text-slate-700 dark:border-slate-500/22 dark:bg-white/8 dark:text-slate-100",
    value: "text-slate-950 dark:text-slate-50",
    subtitle: "text-slate-600 dark:text-slate-100",
  };
  return {
    card: "border-slate-200 bg-white/90 text-slate-950 shadow-[0_12px_26px_rgba(15,23,42,0.08)] dark:border-slate-500/24 dark:bg-white/8 dark:text-slate-50",
    eyebrow: "text-slate-600 dark:text-slate-100",
    icon: "border border-slate-200 bg-white/90 text-slate-700 dark:border-slate-500/22 dark:bg-white/8 dark:text-slate-100",
    value: "text-slate-950 dark:text-slate-50",
    subtitle: "text-slate-600 dark:text-slate-100",
  };
}

function getMetricCardBadgeClass(tone, solidStatusCard) {
  if (solidStatusCard) {
    return "border-black/8 bg-white/72 text-current dark:border-white/12 dark:bg-white/8";
  }
  if (tone === "offline") return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-100";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-800 dark:border-red-400/24 dark:bg-red-400/10 dark:text-red-100";
  if (tone === "caution") return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-400/24 dark:bg-orange-400/10 dark:text-orange-100";
  if (tone === "watch") return "border-yellow-200 bg-yellow-50 text-amber-800 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-100";
  if (tone === "safe") return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/24 dark:bg-emerald-400/10 dark:text-emerald-100";
  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/24 dark:bg-white/6 dark:text-slate-200";
}

function getStatusIcon(tone) {
  const normalized = String(tone || "").toUpperCase();
  if (normalized === "OFFLINE") return <XCircle className="w-5 h-5" />;
  if (normalized === "DANGER") return <AlertTriangle className="w-5 h-5" />;
  if (normalized === "CAUTION") return <AlertCircle className="w-5 h-5" />;
  if (normalized === "WATCH") return <AlertCircle className="w-5 h-5" />;
  if (normalized === "SAFE") return <CheckCircle2 className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
}

function RainfallAnimation({ isActive, intensity }) {
  // Determine drop count and intensity class based on rain level
  let dropCount = 5;
  let intensityClass = 'light';

  const normalizedIntensity = String(intensity || 'LIGHT').toUpperCase();
  
  if (normalizedIntensity === 'VIOLENT') {
    dropCount = 24;
    intensityClass = 'violent';
  } else if (normalizedIntensity === 'HEAVY') {
    dropCount = 12;
    intensityClass = 'heavy';
  } else if (normalizedIntensity === 'MODERATE') {
    dropCount = 8;
    intensityClass = 'moderate';
  } else if (normalizedIntensity === 'LIGHT') {
    dropCount = 5;
    intensityClass = 'light';
  }

  const drops = Array.from({ length: dropCount });

  return (
    <div className={`rainfall-animation`}>
      <div className={`rainfall-drops ${isActive ? 'active' : ''}`}>
        {drops.map((_, index) => (
          <div key={index} className={`rain-drop ${intensityClass}`} />
        ))}
      </div>
    </div>
  );
}
