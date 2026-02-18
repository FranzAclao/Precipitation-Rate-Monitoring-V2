import React, { useState, useEffect } from "react";
import { useFloodData } from "@/hooks/useFloodData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/map";
import RainfallChart from "@/components/RainfallChart";
import { CloudRain, Waves, Activity, Clock, Droplets, Calendar } from "lucide-react";

export default function Dashboard() {
  const { rain, node1, node2, history, allLogs, lastUpdate, loading } = useFloodData();
  
  // State for the Date Picker (Default to Today)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartData, setChartData] = useState([]);

  // Filter Logic: Runs whenever 'selectedDate' or 'allLogs' changes
  useEffect(() => {
    if (allLogs.length > 0) {
      // Filter logs that match the selected date string (e.g., "2024-02-18")
      const dailyData = allLogs.filter(log => log.fullDate === selectedDate);
      
      // If data exists for that day, show it. Otherwise, show empty or default.
      if (dailyData.length > 0) {
        setChartData(dailyData);
      } else {
        // Optional: If today is selected but no data yet, fallback to 'history' (live)
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDate === todayStr) {
           setChartData(history);
        } else {
           setChartData([]); // No data for that past date
        }
      }
    }
  }, [selectedDate, allLogs, history]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400 font-medium">
      Syncing with Sensors...
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">FloodSense Dashboard</h1>
           <p className="text-slate-500">Real-time Monitoring System</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-xs font-bold text-slate-400 uppercase">Last Sync</div>
           <div className="font-mono font-bold text-slate-700">{lastUpdate}</div>
        </div>
      </header>
      
      {/* 6 METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard title="Current Rain" value={rain.intensity} subtitle={rain.rate} icon={<CloudRain className="text-blue-500 w-4 h-4" />} />
        <MetricCard title="Rainfall (1hr)" value={rain.total1h} subtitle="Accumulated" icon={<Droplets className="text-blue-600 w-4 h-4" />} />
        <MetricCard title="Node 1 Level" value={node1.level} subtitle={node1.label} status={node1.status} icon={<Waves className="text-cyan-500 w-4 h-4" />} />
        <MetricCard title="Node 2 Level" value={node2.level} subtitle={node2.label} status={node2.status} icon={<Waves className="text-cyan-600 w-4 h-4" />} />
        <MetricCard title="Flood Risk" value="MODERATE" subtitle="62% Prob." icon={<Activity className="text-orange-500 w-4 h-4" />} />
        <MetricCard title="System Status" value="LIVE" subtitle="Active" icon={<Clock className="text-emerald-500 w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* CHART CONTAINER WITH DATE PICKER */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
              {/* Date Picker Positioned Absolute Top-Right */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-bold text-slate-600 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500 bg-slate-50"
                 />
              </div>
              
              <RainfallChart data={chartData} />
           </div>

           <Map node1={node1} node2={node2} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest border-b pb-2">System Events</h3>
            <div className="space-y-3">
               {node1.status === 'offline' && <AlertItem type="critical" msg="Station 1 is currently offline (No GPS/Level data)." />}
               {node2.status === 'offline' && <AlertItem type="warning" msg="Station 2 is currently offline." />}
               <AlertItem type="normal" msg="Database handshake successful." />
               <AlertItem type="normal" msg="Predictive model standing by." />
            </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function MetricCard({ title, value, subtitle, icon, status }) {
  const isOffline = status === 'offline';
  return (
    <Card className={`border-none shadow-sm transition-all hover:shadow-md ${isOffline ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isOffline ? 'text-slate-400' : 'text-slate-900'}`}>{value}</div>
        <p className={`text-[10px] font-bold uppercase mt-1 ${isOffline ? 'text-red-400' : 'text-blue-500'}`}>{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function AlertItem({ type, msg }) {
  const colors = {
    critical: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    normal: "bg-blue-50 text-blue-700 border-blue-100"
  };
  return <div className={`p-3 rounded-lg border text-xs font-medium ${colors[type]}`}>{msg}</div>;
}