import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, query, limitToLast, onValue } from "firebase/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Data() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the last 50 entries from Node 2 (Rainfall & Water Level)
    const logsRef = query(ref(database, "Node2"), limitToLast(50));

    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to Array and Sort (Newest First)
        const formattedLogs = Object.entries(data)
          .map(([key, val]) => ({
            id: key,
            timestamp: val.Timestamp,
            rainRate: val.RainRate || 0,
            waterLevel: val.WaterLevel || 0,
            status: val.LevelLabel || "Normal"
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort Descending
        
        setLogs(formattedLogs);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">System Data Logs</h1>
        <p className="text-slate-500 mb-6">Historical sensor readings for Del Carmen Station (Node 2)</p>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sensor Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading records...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Rain Rate (mm/hr)</TableHead>
                    <TableHead>Water Level (cm)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.timestamp}</TableCell>
                      <TableCell>{log.rainRate} mm/hr</TableCell>
                      <TableCell>{log.waterLevel} cm</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          log.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                          log.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {log.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}