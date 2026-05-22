import React, { useState, useMemo } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RainfallChart({ data = [], node1Data = [], node2Data = [] }) {
  const [view, setView] = useState('both');

  const chartData = useMemo(() => {
    const timeMap = {};

    // Helper to turn "01:30 PM" into a sortable number (minutes of day)
    const getMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      let h = parseInt(hours, 10);
      if (modifier === 'PM') h += 12;
      return h * 60 + parseInt(minutes, 10);
    };

    // Combine all passed props into the internal map
    const process = (arr, nodeKey) => {
      arr.forEach(d => {
        if (!d?.time) return;
        if (!timeMap[d.time]) timeMap[d.time] = { time: d.time, sortVal: getMinutes(d.time) };
        
        // If it's a log with nodeId, place it in the correct slot
        if (d.nodeId === 'node1') {
          timeMap[d.time].node1 = d.rain;
          timeMap[d.time].node1Level = d.level;
        } else if (d.nodeId === 'node2') {
          timeMap[d.time].node2 = d.rain;
          timeMap[d.time].node2Level = d.level;
        } else if (nodeKey) {
          timeMap[d.time][nodeKey] = d.rain;
          timeMap[d.time][`${nodeKey}Level`] = d.level;
        }
        else {
          // Fallback for general historical logs
          timeMap[d.time].node1 = d.rain;
          timeMap[d.time].node2 = d.rain;
        }
      });
    };

    process(data); 
    process(node1Data, 'node1');
    process(node2Data, 'node2');

    return Object.values(timeMap).sort((a, b) => a.sortVal - b.sortVal);
  }, [data, node1Data, node2Data]);

  return (
    <div className="h-[360px] w-full flex flex-col">
      <div className="flex-1 min-h-0 pt-8">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-300 font-bold uppercase text-xs">No Data for this selection</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorN1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorN2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rain" unit="mm" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="level" orientation="right" unit="cm" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              
              {(view === 'both' || view === 'node1') && (
                <>
                  <Area yAxisId="rain" type="linear" dataKey="node1" stroke="#10b981" fill="url(#colorN1)" strokeWidth={2} connectNulls />
                  <Line yAxisId="level" type="linear" dataKey="node1Level" stroke="#f59e0b" strokeWidth={2.5} dot={false} connectNulls />
                </>
              )}
              {(view === 'both' || view === 'node2') && (
                <>
                  <Area yAxisId="rain" type="linear" dataKey="node2" stroke="#3b82f6" fill="url(#colorN2)" strokeWidth={2} connectNulls />
                  <Line yAxisId="level" type="linear" dataKey="node2Level" stroke="#ef4444" strokeWidth={2.5} dot={false} connectNulls />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <div className="mr-auto flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Node 1 Rain</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>Node 2 Rain</span>
          <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-amber-500"></span>Node 1 Water Level</span>
          <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-red-500"></span>Node 2 Water Level</span>
        </div>
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <button
            onClick={() => setView('both')}
            className={`px-4 py-1 rounded-md text-[10px] font-bold transition-colors ${
              view === 'both' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            BOTH
          </button>
          <button
            onClick={() => setView('node1')}
            className={`px-4 py-1 rounded-md text-[10px] font-bold transition-colors ${
              view === 'node1' ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            NODE 1
          </button>
          <button
            onClick={() => setView('node2')}
            className={`px-4 py-1 rounded-md text-[10px] font-bold transition-colors ${
              view === 'node2' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            NODE 2
          </button>
        </div>
      </div>
    </div>
  );
}
