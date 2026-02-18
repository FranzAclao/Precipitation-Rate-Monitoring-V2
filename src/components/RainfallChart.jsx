import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RainfallChart({ data }) {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-400">No Chart Data</div>;

  return (
    <div className="h-[300px] w-full">
      <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Rainfall Trend (Last 12 Updates)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
          <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} unit="mm" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="rain" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorRain)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}