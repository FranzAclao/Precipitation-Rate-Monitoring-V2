import React, { useState, useMemo } from 'react';
import { useFloodData } from '../../hooks/useFloodData'; 
import { Download } from 'lucide-react'; 

export default function Data() {
  // Pull standardized allLogs from the hook
  const { allLogs, loading } = useFloodData();
  const [activeTab, setActiveTab] = useState('node2');

  // Filter logs based on the active tab and nodeId
  const currentLogs = useMemo(() => {
    return (allLogs || []).filter(log => log.nodeId === activeTab);
  }, [allLogs, activeTab]);

  const downloadCSV = () => {
    if (currentLogs.length === 0) return;

    const headers = ["Timestamp", "Rain Rate (mm/hr)", "Water Level (cm)", "Status"];
    
    const csvRows = currentLogs.map(log => [
      `"${log.timestamp}"`, 
      log.rain || 0, // Updated to standardized 'rain' key
      log.level || 0, // Updated to standardized 'level' key
      `"${log.status || 'N/A'}"`
    ]);

    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LAWOM_${activeTab}_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground font-medium animate-pulse">
        Loading historical data...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in-out">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Data Logs</h1>
          <p className="text-muted-foreground mt-2">Historical sensor readings for Del Carmen Stations</p>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('node1')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node1' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-muted-foreground hover:bg-muted'
          }`}
        >
          Node 1 Logs
        </button>
        <button
          onClick={() => setActiveTab('node2')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node2' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-muted-foreground hover:bg-muted'
          }`}
        >
          Node 2 Logs
        </button>
      </div>

      <div 
        key={activeTab}
        className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
          <h2 className="font-bold text-foreground">
            Recent Sensor Activity ({activeTab === 'node1' ? 'Node 1' : 'Node 2'})
          </h2>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-card sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-4 font-semibold border-b">Timestamp</th>
                <th className="p-4 font-semibold border-b">Rain Rate (mm/hr)</th>
                <th className="p-4 font-semibold border-b">Water Level (cm)</th>
                <th className="p-4 font-semibold border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">{log.timestamp}</td>
                  <td className="p-4">{log.rain} mm/hr</td> {/* Use 'rain' key */}
                  <td className="p-4">{log.level} cm</td> {/* Use 'level' key */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.status?.toLowerCase() === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                      log.status?.toLowerCase() === 'warning' || log.status?.toLowerCase() === 'caution' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted-foreground italic">
                    No logs found for this station.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
