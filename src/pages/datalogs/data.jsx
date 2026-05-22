import React, { useEffect, useMemo, useState } from 'react';
import { useFloodData } from '../../hooks/useFloodData';
import { AppLoader } from '@/components/AppLoader.jsx';
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Data() {
  // Pull standardized allLogs from the hook
  const { allLogs, loading } = useFloodData();
  const [activeTab, setActiveTab] = useState('node2');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  // Filter logs based on the active tab and nodeId
  const filteredLogs = useMemo(() => {
    return (allLogs || []).filter(log => log.nodeId === activeTab);
  }, [allLogs, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when tab changes
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsTabSwitching(true);
    setActiveTab(tab);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!isTabSwitching) return;
    const timeoutId = window.setTimeout(() => setIsTabSwitching(false), 180);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, isTabSwitching]);

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const downloadCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Timestamp", "Rain Rate (mm/hr)", "Water Level (cm)", "Status"];

    const csvRows = filteredLogs.map(log => [
      `"${log.timestamp}"`,
      log.rain || 0,
      log.level || 0,
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
    return <AppLoader label="Loading Data Logs..." />;
  }

  return (
    <div className="app-page-stack animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in-out">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Data Logs</h1>
          <p className="app-page-copy mt-2">Historical sensor readings for Del Carmen Stations</p>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="app-action-button rounded-2xl px-4 py-2 text-sm tracking-[0.12em]"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-border pb-2">
        <button
          onClick={() => handleTabChange('node1')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node1' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-muted-foreground hover:bg-muted'
          }`}
        >
          Node 1 Logs
        </button>
        <button
          onClick={() => handleTabChange('node2')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
            activeTab === 'node2' 
              ? 'bg-slate-900 text-white' 
              : 'bg-transparent text-muted-foreground hover:bg-muted'
          }`}
        >
          Node 2 Logs
        </button>
      </div>

      {isTabSwitching ? (
        <AppLoader label="Loading Logs..." />
      ) : (
        <div
          key={activeTab}
          className="app-card overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div className="-mx-5 -mt-5 mb-0 flex justify-between items-center border-b border-slate-300 bg-muted px-5 py-4">
            <h2 className="font-bold text-foreground">
              Recent Sensor Activity ({activeTab === 'node1' ? 'Node 1' : 'Node 2'})
            </h2>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-card sticky top-0 shadow-md z-10">
                <tr>
                  <th className="p-4 font-semibold border-b">Timestamp</th>
                  <th className="p-4 font-semibold border-b">Rain Rate (mm/hr)</th>
                  <th className="p-4 font-semibold border-b">Water Level (cm)</th>
                  <th className="p-4 font-semibold border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted transition-colors">
                    <td className="p-4 font-mono text-muted-foreground">{log.timestamp}</td>
                    <td className="p-4">{log.rain} mm/hr</td>
                    <td className="p-4">{log.level} cm</td>
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
                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-muted-foreground italic">
                      No logs found for this station.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-border rounded text-sm bg-background"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries per page</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-border rounded text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, currentPage + 2);
                      return page >= start && page <= end;
                    })
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-border rounded text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
