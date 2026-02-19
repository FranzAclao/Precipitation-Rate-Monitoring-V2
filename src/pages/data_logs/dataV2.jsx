import React, { useState } from 'react';
import { useFloodData } from '../../hooks/useFloodData'; 
import { Download } from 'lucide-react'; 

export default function Data() {
  const { node1Logs, node2Logs, loading } = useFloodData();
  const [activeTab, setActiveTab] = useState('node2');
  
  const currentLogs = (activeTab === 'node1' ? node1Logs : node2Logs) || [];

  const downloadCSV = () => {
    if (currentLogs.length === 0) return;

    const headers = ["Timestamp", "Rain Rate (mm/hr)", "Water Level (cm)", "Status"];
    
    const csvRows = currentLogs.map(log => [
      `"${log?.timestamp || ''}"`, 
      log?.rainRate || 0,
      log?.waterLevel || 0,
      `"${log?.status || 'Unknown'}"`
    ]);

    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FloodSense_${activeTab}_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-medium animate-pulse">
        Loading historical data...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in-out">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Data Logs</h1>
          <p className="text-slate-500 mt-2">Historical sensor readings for Del Carmen Stations</p>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('node1')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node1' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-slate-500 hover:bg-slate-100'
          }`}
        >
          Node 1 Logs
        </button>
        <button
          onClick={() => setActiveTab('node2')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node2' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-slate-500 hover:bg-slate-100'
          }`}
        >
          Node 2 Logs
        </button>
      </div>

      <div 
        key={activeTab}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700">
            Recent Sensor Activity ({activeTab === 'node1' ? 'Node 1' : 'Node 2'})
          </h2>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-4 font-semibold border-b">Timestamp</th>
                <th className="p-4 font-semibold border-b">Rain Rate (mm/hr)</th>
                <th className="p-4 font-semibold border-b">Water Level (cm)</th>
                <th className="p-4 font-semibold border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => {
                const safeStatus = (log?.status || '').toLowerCase();
                
                let statusClasses = 'bg-slate-100 text-slate-700'; // Default
                if (safeStatus === 'safe') {
                  statusClasses = 'bg-emerald-100 text-emerald-700';
                } else if (safeStatus === 'warning' || safeStatus === 'caution') {
                  statusClasses = 'bg-amber-100 text-amber-700';
                } else if (safeStatus === 'danger' || safeStatus === 'critical') {
                  statusClasses = 'bg-red-100 text-red-700';
                }

                return (
                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-500">{log?.timestamp || 'N/A'}</td>
                    <td className="p-4">{log?.rainRate || 0} mm/hr</td>
                    <td className="p-4">{log?.waterLevel || 0} cm</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${statusClasses}`}>
                        {log?.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 italic">
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