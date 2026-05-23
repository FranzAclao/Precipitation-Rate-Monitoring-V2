import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFloodData } from "@/hooks/useFloodData";
import RainfallChart from "@/components/RainfallChart";
import DataLogs from "@/pages/datalogs/data";
import AnalysisPage from "@/pages/analysis/analysis";
import AlertsPage from "@/pages/alerts/alerts.jsx";
import { 
  CloudRain, Waves, Activity, Clock, Droplets, Calendar, AlertTriangle, Eye, Check, CircleAlert,
  RefreshCcw
} from "lucide-react";
import { AppLoader } from "@/components/AppLoader.jsx";
import LocationsPage from "@/pages/locations/LocationsPage.jsx";
import SettingsPage from "@/pages/settings/settings.jsx";
import CanalSvg from "@/components/CanalSvg.jsx";
import "./dashboard.css";

const LEVEL_META = {
  SAFE: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    solid: "border-sky-500 bg-sky-500 text-white",
    water: "from-emerald-200 via-emerald-300 to-emerald-400",
    surface: "#bbf7d0",
    marker: "bg-emerald-500",
  },
  WATCH: {
    pill: "border-yellow-200 bg-yellow-50 text-amber-700",
    solid: "border-yellow-400 bg-yellow-400 text-slate-950",
    water: "from-yellow-200 via-yellow-300 to-amber-300",
    surface: "#fde68a",
    marker: "bg-amber-400",
  },
  CAUTION: {
    pill: "border-orange-200 bg-orange-50 text-orange-700",
    solid: "border-orange-500 bg-orange-500 text-white",
    water: "from-orange-200 via-orange-300 to-orange-400",
    surface: "#fdba74",
    marker: "bg-orange-500",
  },
  DANGER: {
    pill: "border-red-200 bg-red-50 text-red-700",
    solid: "border-red-500 bg-red-500 text-white",
    water: "from-red-200 via-red-300 to-red-400",
    surface: "#fca5a5",
    marker: "bg-red-500",
  },
  MONITORING: {
    pill: "border-slate-200 bg-slate-50 text-slate-700",
    solid: "border-slate-400 bg-slate-400 text-white",
    water: "from-sky-200 via-sky-300 to-sky-400",
    surface: "#bae6fd",
    marker: "bg-slate-400",
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
          subtitle: "Historical view",
        };
      }

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
      buildMetric("node1", "Node 1 System Status"),
      buildMetric("node2", "Node 2 System Status"),
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

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <MetricCard
                title="Rain Intensity"
                value={rain.intensity}
                subtitle={rain.status === "offline" ? "Offline sensor state" : `${rain.rate}`}
                icon={<CloudRain className="w-5 h-5" />}
                darkTheme
              />
              <MetricCard
                title="Accumulated Rainfall"
                value={rain.total1h}
                subtitle={rain.status === "active" ? "Current rainfall event" : rain.status === "offline" ? "Offline sensor state" : "No active rainfall"}
                icon={<Droplets className="w-5 h-5" />}
                darkTheme
              />
              {telemetryMetrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  icon={<Clock className="w-5 h-5" />}
                  darkTheme
                />
              ))}
              <MetricCard
                title="Overall Status"
                value={getDisplayStatusName(sectionRisk)}
                subtitle="Current canal risk status"
                icon={<AlertTriangle className="w-5 h-5" />}
                solidStatusLevel={sectionRisk}
              />
            </div>

            <WaterLevelSection node1={node1} node2={node2} lastUpdate={lastUpdate} />

            <div id="sensor-telemetry" className="app-card mt-8 p-4 sm:p-6 relative overflow-hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Sensor Telemetry</h3>
                
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
      <div className="space-y-5">
        <div className="water-level-top-shell">
          <div className="water-level-header">
            <div>
              <h2 className="water-level-heading text-xl font-black tracking-tight md:text-2xl">Water Level Overview</h2>
              <p className="water-level-subtitle">Monitor the canal water level status.</p>
              <div className="water-level-status-row">
              </div>
            </div>
          </div>
          <div className="water-level-summary-grid">
            {nodes.map((item) => (
              <NodeSummaryCard key={item.key} title={item.title} node={item.node} />
            ))}
          </div>
        </div>
        <div className="water-level-bottom-grid">
          <FloodRiskStack activeLevel={sectionRisk} maxLevel={getGuideMaxLevel(node1, node2)} />

          <div className="water-level-canal-grid">
            {nodes.map((item) => (
              <CanalPanel key={item.key} title={item.title} node={item.node} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, subtitle, icon, status, darkTheme = false, solidStatusLevel = null }) {
  const isOffline = status === 'offline';
  const solidStatusCard = solidStatusLevel ? getOverallStatusMetricCardClass(solidStatusLevel) : null;
  
  return (
    <div className={`relative app-subcard p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between min-h-[128px] sm:min-h-[140px] group ${
      solidStatusCard
        ? `${solidStatusCard.card} hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]`
        : isOffline 
        ? darkTheme
          ? 'opacity-90 text-slate-700'
          : 'opacity-80 bg-muted/60 border-border text-card-foreground'
        : darkTheme
          ? 'text-foreground hover:border-brand-teal/30 hover:shadow-[0_8px_24px_rgba(69,167,185,0.12)] hover:-translate-y-1'
          : 'bg-card text-card-foreground border-border hover:border-brand-teal/40 hover:shadow-[0_8px_24px_rgba(69,167,185,0.12)] hover:-translate-y-1'
    }`}>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
          solidStatusCard
            ? solidStatusCard.eyebrow
            : darkTheme ? 'text-slate-400 group-hover:text-slate-300' : 'text-muted-foreground'
        }`}>
          {title}
        </h3>
        
        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
          solidStatusCard
            ? solidStatusCard.icon
            : isOffline 
            ? darkTheme
              ? 'bg-slate-100 text-slate-500'
              : 'bg-muted text-muted-foreground'
            : darkTheme
              ? 'bg-slate-100 text-slate-700'
              : 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white'
        }`}>
          {icon}
        </div>
      </div>
      
      <div>
        <div className={`break-words text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
          solidStatusCard
            ? solidStatusCard.value
            : isOffline
            ? darkTheme ? 'text-slate-600' : 'text-muted-foreground'
            : 'text-foreground'
        }`}>
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isOffline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
              <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider">OFFLINE</p>
            </>
          ) : (
            <p className={`text-[10px] font-bold uppercase tracking-wider ${
              solidStatusCard
                ? solidStatusCard.subtitle
                : darkTheme ? 'text-slate-500 group-hover:text-slate-600' : 'text-muted-foreground'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeSummaryCard({ title, node }) {
  const status = getNodeStatus(node);
  const trend = getNodeTrend(node);
  const hasExceededLevel = isAboveWaterLevelLimit(node);
  const isOffline = node?.status === "offline";
  const iconTone = getNodeIconTone(status, isOffline);
  const hoverTone = getNodeHoverTone(status, isOffline);

  return (
    <div className={`relative app-subcard bg-card text-card-foreground p-4 transition-all duration-300 flex flex-col justify-between min-h-[176px] group ${
      isOffline
        ? ""
        : hoverTone
    }`}>
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
          {hasExceededLevel && (
            <div className="water-level-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Water level exceeded 55 cm
            </div>
          )}
        </div>
      </div>
      <div className="water-level-mini-grid">
        <NodeMiniStat label="Level Status" value={status.badge} tone={status.meta.text} />
        <NodeMiniStat label="Trend" value={trend.value} tone={trend.tone} />
        <NodeMiniStat label="Last Updated" value={formatNodeTime(node?.timestamp)} />
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

function FloodRiskStack({ activeLevel, maxLevel }) {
  const levels = [
    {
      key: "SAFE",
      label: "Safe",
      description: "Normal water level",
      tint: "bg-[#9edcff] border-[#68b9e8]",
      text: "text-slate-950",
      subtext: "text-slate-800",
      current: "text-sky-700",
      icon: Check,
    },
    {
      key: "WATCH",
      label: "Watch",
      description: "Monitor closely",
      tint: "bg-[#ffd54a] border-[#e0b93c]",
      text: "text-slate-950",
      subtext: "text-slate-800",
      current: "text-amber-700",
      icon: Eye,
    },
    {
      key: "CAUTION",
      label: "Caution",
      description: "Elevated level",
      tint: "bg-[#f59b00] border-[#d98200]",
      text: "text-white",
      subtext: "text-white/90",
      current: "text-orange-700",
      icon: CircleAlert,
    },
    {
      key: "DANGER",
      label: "Flood Risk",
      description: "Possible overflow",
      tint: "bg-[#eb3434] border-[#c62828]",
      text: "text-white",
      subtext: "text-white/90",
      current: "text-red-700",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="water-level-card">
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status Guide</p>
        <p className="mt-2 text-lg font-black tracking-tight text-foreground">Water level Status</p>
      </div>
      <div className="water-level-guide">
        {levels.map((level) => {
          const isActive = normalizeLevelLabel(activeLevel) === level.key;
          const Icon = level.icon;
          return (
            <div
              key={level.key}
              className={`water-level-guide-item transition-all ${level.tint} ${isActive ? "shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-black/10" : "shadow-sm"}`}
            >
              <div className="water-level-guide-copy">
                <div className="water-level-guide-top">
                  <div className="water-level-guide-status">
                    <span className="water-level-guide-icon">
                      <Icon className={`h-4 w-4 ${level.text}`} />
                    </span>
                    <p className={`text-base font-black tracking-tight ${level.text}`}>{level.label}</p>
                  </div>
                </div>
                <p className={`water-level-guide-threshold ${level.subtext}`}>{getGuideThresholdText(level.key, maxLevel)}</p>
                <p className={`water-level-guide-description ${level.subtext}`}>{level.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CanalPanel({ title, node }) {
  const status = getNodeStatus(node);
  const canalStatus = getCanalStatusValue(status);
  const hasExceededLevel = isAboveWaterLevelLimit(node);

  return (
    <div className="water-level-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="water-level-node-title">{title}</p>
          <p className="mt-2 text-lg font-black tracking-tight text-foreground">Canal View</p>
        </div>
      </div>

      <div className="water-level-visual">
        <CanalSvg
          level={node?.level}
          maxLevel={node?.maxLevel}
          status={canalStatus}
          hasData={status.hasData}
        />

      </div>
      <p className="water-level-note">
        {status.hasData ? getStatusDescription(canalStatus) : "Awaiting telemetry from this monitoring node."}
      </p>
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

function formatDepth(value, unit) {
  const numeric = toLevelNumber(value);
  if (numeric === null) return "--";
  return `${numeric.toFixed(2)} ${unit}`;
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
  if (status?.normalized === "SAFE") return "bg-sky-500 text-white";
  return "bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white";
}

function getNodeHoverTone(status, isOffline) {
  if (isOffline) return "opacity-80 bg-muted/60";
  if (status?.normalized === "DANGER") {
    return "hover:border-red-400/70 hover:shadow-[0_8px_24px_rgba(239,68,68,0.2)] hover:-translate-y-1";
  }
  return "hover:border-brand-teal/40 hover:shadow-[0_8px_24px_rgba(69,167,185,0.12)] hover:-translate-y-1";
}

function getSectionLastUpdated(node1, node2) {
  const dates = [node1?.timestamp, node2?.timestamp]
    .map((value) => new Date(String(value || "").replace(" ", "T")))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => b - a);
  if (dates.length === 0) return "--:--:--";
  return dates[0].toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function getGuideMaxLevel(node1, node2) {
  const levels = [toLevelNumber(node1?.maxLevel), toLevelNumber(node2?.maxLevel)].filter((value) => value && value > 0);
  return levels.length ? Math.max(...levels) : null;
}

function getGuideThresholdText(label, maxLevel) {
  if (label === "SAFE") return `< 20 cm`;
  if (label === "WATCH") return `20-35 cm`;
  if (label === "CAUTION") return `36-46 cm`;
  if (label === "DANGER") return `>= 55 cm`;
  return "Threshold pending";
}

function getStatusDescription(status) {
  if (status === "flood-risk") return "Water level is above the flood-risk threshold.";
  if (status === "caution") return "Water level is elevated and should be watched closely.";
  if (status === "watch") return "Water level is within the watch range.";
  if (status === "safe") return "Water level is within the normal operating range.";
  return "Awaiting telemetry from this monitoring node.";
}

function getOverallStatusMetricCardClass(level) {
  const normalized = normalizeLevelLabel(level);
  if (normalized === "DANGER") return {
    card: "border-red-600 bg-red-600 text-white shadow-[0_10px_24px_rgba(185,28,28,0.28)]",
    eyebrow: "text-red-100",
    icon: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-red-100",
  };
  if (normalized === "CAUTION") return {
    card: "border-orange-500 bg-orange-500 text-white shadow-[0_10px_24px_rgba(234,88,12,0.24)]",
    eyebrow: "text-orange-100",
    icon: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-orange-100",
  };
  if (normalized === "WATCH") return {
    card: "border-yellow-400 bg-yellow-400 text-slate-950 shadow-[0_10px_24px_rgba(250,204,21,0.22)]",
    eyebrow: "text-slate-700",
    icon: "bg-white/35 text-slate-950",
    value: "text-slate-950",
    subtitle: "text-slate-700",
  };
  if (normalized === "SAFE") return {
    card: "border-sky-500 bg-sky-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)]",
    eyebrow: "text-sky-100",
    icon: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-sky-100",
  };
  return {
    card: "border-slate-400 bg-slate-400 text-white shadow-[0_10px_24px_rgba(100,116,139,0.18)]",
    eyebrow: "text-slate-100",
    icon: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-slate-100",
  };
}
