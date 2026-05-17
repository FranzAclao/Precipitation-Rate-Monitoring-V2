import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFloodData } from "@/hooks/useFloodData";
import RainfallChart from "@/components/RainfallChart";
import DataLogs from "@/pages/datalogs/data";
import AnalysisPage from "@/pages/analysis/analysis";
import AlertsPage from "@/pages/alerts/alerts.jsx";
import { 
  CloudRain, Waves, Activity, Clock, Droplets, Calendar, 
  RefreshCcw
} from "lucide-react";
import { Header } from "@/components/Header.jsx";
import PageSkeleton from "@/components/PageSkeleton.jsx";
import { Sidebar } from "@/components/Sidebar.jsx";
import LocationsPage from "@/pages/locations/LocationsPage.jsx";
import SettingsPage from "@/pages/settings/settings.jsx";

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  const { rain, node1, node2, allLogs, lastUpdate, loading } = useFloodData();
  const location = useLocation();

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isViewSwitching, setIsViewSwitching] = useState(false);
  const routeToView = useMemo(() => ({
    "/": "overview",
    "/geospatial-status": "locations",
    "/locations": "locations",
    "/data": "data",
    "/analysis": "analysis",
    "/alerts": "alerts",
    "/settings": "settings",
  }), []);
  const activeView = routeToView[location.pathname] || "overview";
  const viewTitles = useMemo(() => ({
    overview: "Dashboard",
    locations: "Sensor Nodes",
    data: "Data Logs",
    analysis: "ML Analysis",
    alerts: "Alerts",
    settings: "Settings",
  }), []);
  const headerTitle = viewTitles[activeView] || "Overview";

  const chartData = useMemo(() => {
    if (!allLogs || allLogs.length === 0) return [];
    return allLogs.filter(log => log.fullDate === selectedDate);
  }, [selectedDate, allLogs]);

  useEffect(() => {
    setIsViewSwitching(true);
    const timeoutId = window.setTimeout(() => setIsViewSwitching(false), 180);
    return () => window.clearTimeout(timeoutId);
  }, [activeView]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-muted-foreground font-medium">
      <div className="relative flex h-12 w-12 mb-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-12 w-12 bg-blue-500 items-center justify-center">
          <RefreshCcw className="text-white animate-spin-slow" size={24} />
        </span>
      </div>
      <p className="tracking-widest text-xs font-bold uppercase">Syncing with Sensors...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans md:h-screen md:overflow-hidden">
      <Sidebar activeView={activeView} node1={node1} node2={node2} lastUpdate={lastUpdate} />

      <main className="flex-1 overflow-y-auto bg-background px-4 pb-28 pt-5 animate-in fade-in duration-500 sm:px-6 md:p-10">
        <Header title={headerTitle} />

        {isViewSwitching ? <PageSkeleton /> : (
          <>
        {activeView === 'overview' && (
          <div className="space-y-6 max-w-[1600px] mx-auto">
            <header className="mb-8">
              <p className="text-sm text-muted-foreground font-medium mt-1">Real-time metrics and historical rainfall data.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
              <MetricCard title="Rain Intensity" value={rain.intensity} subtitle={rain.source} icon={<CloudRain className="w-5 h-5" />} />
              <MetricCard title="Rainfall (1hr)" value={rain.total1h} subtitle="Accumulated" icon={<Droplets className="w-5 h-5" />} />
              <MetricCard title="Node 1 Level" value={node1.level} subtitle={node1.label} status={node1.status} icon={<Waves className="w-5 h-5" />} />
              <MetricCard title="Node 2 Level" value={node2.level} subtitle={node2.label} status={node2.status} icon={<Waves className="w-5 h-5" />} />
              <MetricCard title="Flood Risk" value="MODERATE" subtitle="62% Prob." icon={<Activity className="w-5 h-5" />} />
              <MetricCard title="System Mode" value={selectedDate === todayStr ? "LIVE" : "ARCHIVE"} subtitle="Status" icon={<Clock className="w-5 h-5" />} />
            </div>

            {/* Chart Area */}
            <div className="mt-8 bg-card text-card-foreground p-4 sm:p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
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
        )}

      </main>
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

function MetricCard({ title, value, subtitle, icon, status }) {
  const isOffline = status === 'offline';
  
  return (
    <div className={`relative bg-card text-card-foreground p-4 sm:p-5 rounded-2xl border border-border transition-all duration-300 flex flex-col justify-between min-h-[128px] sm:min-h-[140px] group ${
      isOffline 
        ? 'opacity-80 bg-muted/60' 
        : 'hover:border-brand-teal/40 hover:shadow-[0_8px_24px_rgba(69,167,185,0.12)] hover:-translate-y-1'
    }`}>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
          {title}
        </h3>
        
        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
          isOffline 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white'
        }`}>
          {icon}
        </div>
      </div>
      
      <div>
        <div className={`break-words text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${isOffline ? 'text-muted-foreground' : 'text-foreground'}`}>
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isOffline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
              <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider">OFFLINE</p>
            </>
          ) : (
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
