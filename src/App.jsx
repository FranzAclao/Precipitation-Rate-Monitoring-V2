import React, { useState, useEffect, useMemo } from "react";
import { useFloodData } from "@/hooks/useFloodData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/map";
import RainfallChart from "@/components/RainfallChart";
import { CloudRain, Waves, Activity, Clock, Droplets, Calendar, RefreshCcw, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const { rain, node1, node2, node1History, node2History, history, allLogs, lastUpdate, loading } = useFloodData();
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Optimized: Filter data using useMemo to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!allLogs || allLogs.length === 0) return selectedDate === todayStr ? history : [];
    
    const dailyData = allLogs.filter(log => log.fullDate === selectedDate);
    
    if (dailyData.length > 0) return dailyData;
    // Fallback to live history if today is selected but logs haven't synced yet
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
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
      <header className="mb-8 flex justify-between items-start md:items-end">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="text-blue-600 w-5 h-5" />
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">FloodSense <span className="text-blue-600">Pro</span></h1>
           </div>
           <p className="text-slate-500 text-sm font-medium">Real-time Flood & Rainfall Monitoring</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Network Status: Online</div>
           <div className="flex items-center gap-2 justify-end">
             <div className="font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                {lastUpdate}
             </div>
           </div>
        </div>
      </header>
      
      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard title="Rain Intensity" value={rain.intensity} subtitle={rain.source} icon={<CloudRain className="text-blue-500 w-4 h-4" />} />
        <MetricCard title="Rainfall (1hr)" value={rain.total1h} subtitle="Accumulated" icon={<Droplets className="text-blue-600 w-4 h-4" />} />
        <MetricCard title="Node 1 Level" value={node1.level} subtitle={node1.label} status={node1.status} icon={<Waves className="text-emerald-500 w-4 h-4" />} />
        <MetricCard title="Node 2 Level" value={node2.level} subtitle={node2.label} status={node2.status} icon={<Waves className="text-blue-500 w-4 h-4" />} />
        <MetricCard title="Flood Risk" value="MODERATE" subtitle="62% Prob." icon={<Activity className="text-orange-500 w-4 h-4" />} />
        <MetricCard title="System Mode" value={selectedDate === todayStr ? "LIVE" : "ARCHIVE"} subtitle="Status" icon={<Clock className={`w-4 h-4 ${selectedDate === todayStr ? 'text-emerald-500' : 'text-slate-400'}`} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              
              {/* --- DATE PICKER UI --- */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
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
                   className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-1.5 cursor-pointer hover:border-blue-400 transition-all shadow-sm"
                   onClick={() => document.getElementById('thesis-date-picker')?.showPicker()}
                 >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input 
                       id="thesis-date-picker"
                       type="date" 
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                       className="text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer uppercase"
                    />
                 </div>
              </div>
              
              <RainfallChart data={chartData} node1Data={node1History} node2Data={node2History} />
           </div>

           <Map node1={node1} node2={node2} />
        </div>

        {/* SYSTEM EVENTS SIDEBAR */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              System Events
            </h3>
            <div className="space-y-4">
               {node1.status === 'offline' && <AlertItem type="critical" msg="Station 1 (Upstream) is offline. Check battery." />}
               {node2.status === 'offline' && <AlertItem type="warning" msg="Station 2 (Downstream) heartbeat weak." />}
               <AlertItem type="normal" msg="Predictive Model: Stable" />
               <AlertItem type="normal" msg="Cloud Sync: 100% Active" />
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter">Quick Summary</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                System is monitoring 2 key nodes. Rainfall is currently <strong>{rain.intensity}</strong>. No immediate flood threat detected in the next 30 mins.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, status }) {
  const isOffline = status === 'offline';
  return (
    <Card className={`border-none shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md ${isOffline ? 'opacity-70 bg-slate-100/50' : 'bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
        <CardTitle className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-xl md:text-2xl font-black tracking-tight ${isOffline ? 'text-slate-400' : 'text-slate-900'}`}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          {isOffline && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
          <p className={`text-[10px] font-black uppercase ${isOffline ? 'text-red-500' : 'text-blue-500'}`}>
            {isOffline ? 'OFFLINE' : subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ type, msg }) {
  const styles = {
    critical: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    normal: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return (
    <div className={`p-3 rounded-xl border text-[11px] font-bold leading-tight shadow-sm transition-all ${styles[type]}`}>
      {msg}
    </div>
  );
}