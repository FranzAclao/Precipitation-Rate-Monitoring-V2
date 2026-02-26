import React, { useState, useEffect, useMemo } from "react";
import { useFloodData } from "@/hooks/useFloodData";
import Map from "@/components/map";
import RainfallChart from "@/components/RainfallChart";
import { 
  CloudRain, Waves, Activity, Clock, Droplets, Calendar, 
  RefreshCcw, ShieldCheck, LayoutDashboard, Map as MapIcon, Bell 
} from "lucide-react";

export default function Dashboard() {
  const { rain, node1, node2, node1History, node2History, history, allLogs, lastUpdate, loading } = useFloodData();
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeView, setActiveView] = useState('dashboard'); 

  const chartData = useMemo(() => {
    if (!allLogs || allLogs.length === 0) return selectedDate === todayStr ? history : [];
    const dailyData = allLogs.filter(log => log.fullDate === selectedDate);
    if (dailyData.length > 0) return dailyData;
    return selectedDate === todayStr ? history : [];
  }, [selectedDate, allLogs, history, todayStr]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-slate-400 font-medium">
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-brand-dark border-r border-brand-darker flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-brand-teal w-6 h-6 shrink-0" />
            <h1 className="text-2xl font-black text-white tracking-tight whitespace-nowrap">
              FloodSense <span className="text-brand-teal">Pro</span>
            </h1>
          </div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-2">
            Network: <span className="text-emerald-400">Online</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Overview" 
            isActive={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
          />
          <NavItem 
            icon={<MapIcon size={18} />} 
            label="Geospatial Status" 
            isActive={activeView === 'map'} 
            onClick={() => setActiveView('map')} 
          />
          <NavItem 
            icon={<Bell size={18} />} 
            label="System Events" 
            isActive={activeView === 'events'} 
            onClick={() => setActiveView('events')} 
            badge={node1.status === 'offline' || node2.status === 'offline' ? "!" : null}
          />
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 text-center">Last Sync</p>
          <div className="font-mono text-xs font-bold text-slate-200 bg-white/10 px-3 py-2 rounded-md border border-white/10 shadow-sm text-center">
            {lastUpdate}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 animate-in fade-in duration-500">
        
        {/* --- VIEW: DASHBOARD OVERVIEW --- */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 max-w-[1600px] mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Real-time metrics and historical rainfall data.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard title="Rain Intensity" value={rain.intensity} subtitle={rain.source} icon={<CloudRain className="w-5 h-5" />} />
              <MetricCard title="Rainfall (1hr)" value={rain.total1h} subtitle="Accumulated" icon={<Droplets className="w-5 h-5" />} />
              <MetricCard title="Node 1 Level" value={node1.level} subtitle={node1.label} status={node1.status} icon={<Waves className="w-5 h-5" />} />
              <MetricCard title="Node 2 Level" value={node2.level} subtitle={node2.label} status={node2.status} icon={<Waves className="w-5 h-5" />} />
              <MetricCard title="Flood Risk" value="MODERATE" subtitle="62% Prob." icon={<Activity className="w-5 h-5" />} />
              <MetricCard title="System Mode" value={selectedDate === todayStr ? "LIVE" : "ARCHIVE"} subtitle="Status" icon={<Clock className="w-5 h-5" />} />
            </div>

            {/* Chart Area */}
            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sensor Telemetry</h3>
                
                <div className="flex items-center gap-2">
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
                     className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-brand-teal transition-all shadow-sm"
                     onClick={() => document.getElementById('thesis-date-picker')?.showPicker()}
                   >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <input 
                         id="thesis-date-picker"
                         type="date" 
                         value={selectedDate}
                         onChange={(e) => setSelectedDate(e.target.value)}
                         className="text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer uppercase"
                      />
                   </div>
                </div>
              </div>
              <RainfallChart data={chartData} node1Data={node1History} node2Data={node2History} />
            </div>
          </div>
        )}

        {/* --- VIEW: GEOSPATIAL MAP --- */}
        {activeView === 'map' && (
          <div className="space-y-6 h-full flex flex-col max-w-[1600px] mx-auto">
            <header className="mb-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Geospatial Status</h2>
              <p className="text-sm text-slate-500 font-medium">Live sensor node locations and water levels.</p>
            </header>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] p-2">
              <Map node1={node1} node2={node2} />
            </div>
          </div>
        )}

        {/* --- VIEW: SYSTEM EVENTS --- */}
        {activeView === 'events' && (
          <div className="space-y-6 max-w-[1600px] mx-auto">
            <header className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Events</h2>
              <p className="text-sm text-slate-500 font-medium">Alerts, diagnostics, and system logs.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-3xl">
               <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                 Active Alerts
               </h3>
               
               <div className="space-y-4">
                  {node1.status === 'offline' && <AlertItem type="critical" msg="Station 1 (Upstream) is offline. Check battery or cellular signal." />}
                  {node2.status === 'offline' && <AlertItem type="warning" msg="Station 2 (Downstream) heartbeat weak. Last seen 15 mins ago." />}
                  
                  {node1.status !== 'offline' && node2.status !== 'offline' && (
                    <AlertItem type="normal" msg="All sensor nodes are online and reporting normally." />
                  )}
                  
                  <AlertItem type="normal" msg="Predictive Model: Stable. No flood risk projected." />
                  <AlertItem type="normal" msg="Cloud Sync: 100% Active. Firebase connection secured." />
               </div>
               
               <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter">AI Quick Summary</p>
                 <p className="text-sm text-slate-700 leading-relaxed font-medium">
                   System is currently monitoring 2 key nodes. Rainfall is currently <span className="text-blue-600 font-bold">{rain.intensity}</span>. No immediate flood threat detected in the next 30 minutes based on upstream data.
                 </p>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function NavItem({ icon, label, isActive, onClick, badge }) {

  return (

    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
        isActive
          ? 'border-brand-teal/30 text-yellow-400 shadow-sm border'
          : 'text-slate-300 hover:bg-white/5 hover:text-yellow-400 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* The icon now also stays yellow when the tab is active */}
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
    <div className={`relative bg-white p-5 rounded-2xl border border-slate-200 transition-all duration-300 flex flex-col justify-between min-h-[140px] group ${
      isOffline 
        ? 'opacity-80 bg-slate-50/50' 
        : 'hover:border-brand-teal/40 hover:shadow-[0_8px_24px_rgba(69,167,185,0.12)] hover:-translate-y-1'
    }`}>
      
      {/* Top Row: Title and Icon Box */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
          {title}
        </h3>
        
        {/* Icon Container: Gray if offline, soft teal if online */}
        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
          isOffline 
            ? 'bg-slate-100 text-slate-400' 
            : 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white'
        }`}>
          {icon}
        </div>
      </div>
      
      {/* Bottom Row: Value and Status */}
      <div>
        <div className={`text-2xl lg:text-3xl font-black tracking-tight ${isOffline ? 'text-slate-400' : 'text-slate-900'}`}>
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isOffline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
              <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider">OFFLINE</p>
            </>
          ) : (
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, msg }) {
  const styles = {
    critical: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    normal: "bg-white text-slate-600 border-slate-200"
  };
  return (
    <div className={`p-4 rounded-xl border text-sm font-bold shadow-sm transition-all flex items-start gap-3 ${styles[type]}`}>
      {type === 'critical' && <Activity className="w-5 h-5 text-red-500 shrink-0" />}
      {type === 'warning' && <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
      {type === 'normal' && <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />}
      {msg}
    </div>
  );
}