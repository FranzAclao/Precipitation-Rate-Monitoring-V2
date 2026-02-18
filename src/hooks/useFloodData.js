import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export function useFloodData() {
  const [data, setData] = useState({
    rain: { intensity: "--", rate: 0, total1h: 0, status: "loading" },
    node1: { level: 0, label: "SAFE", status: "loading" },
    node2: { level: 0, label: "SAFE", status: "loading" },
    history: [],    // For the "Live" chart (last 12 points)
    allLogs: [],    // <--- NEW: For the Date Filter
    lastUpdate: "--",
    loading: true,
  });

  useEffect(() => {
    const node1Ref = ref(database, "Node1");
    const node2Ref = ref(database, "Node2");

    const checkOffline = (timestamp) => {
      const sensorTime = new Date(timestamp.replace(" ", "T"));
      const now = new Date();
      return (now - sensorTime) / (1000 * 60) > 15;
    };

    const getRainIntensity = (mm) => {
      if (mm === 0) return "NO RAIN";
      if (mm < 2.5) return "LIGHT";
      if (mm < 7.6) return "MODERATE";
      if (mm < 50) return "HEAVY";
      return "VIOLENT";
    };

    // Node 1 Listener
    const unsub1 = onValue(node1Ref, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const keys = Object.keys(val).sort();
        const latest = val[keys[keys.length - 1]];
        const isOffline = checkOffline(latest.Timestamp);

        setData(prev => ({
          ...prev,
          node1: {
            level: isOffline ? "NO DATA" : parseFloat(latest.WaterLevel || 0).toFixed(2),
            label: isOffline ? "Sensor Asleep" : (latest.LevelLabel || "SAFE").toUpperCase(),
            status: isOffline ? "offline" : "online",
            lat: parseFloat(latest.Latitude || 0),
            lng: parseFloat(latest.Longitude || 0)
          }
        }));
      }
    });

    // Node 2 Listener
    const unsub2 = onValue(node2Ref, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const entries = Object.entries(val).map(([key, v]) => ({ 
            key, 
            ...v,
            // Pre-calculate Date object for easier filtering later
            dateObj: new Date(v.Timestamp.replace(" ", "T")) 
        }));
        
        // Sort ascending (Oldest -> Newest)
        entries.sort((a, b) => a.dateObj - b.dateObj);

        // 1. Prepare "Live" History (Last 12)
        const recentHistory = entries.slice(-12).map(e => ({
            time: e.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rain: parseFloat(e.RainRate || 0)
        }));

        // 2. Prepare "All Logs" for filtering
        const allLogs = entries.map(e => ({
            fullDate: e.Timestamp.split(" ")[0], // "2024-02-18"
            time: e.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rain: parseFloat(e.RainRate || 0)
        }));

        const latest = entries[entries.length - 1];
        const isOffline = checkOffline(latest.Timestamp);

        setData(prev => ({
          ...prev,
          rain: {
            intensity: isOffline ? "NO DATA" : getRainIntensity(latest.RainRate || 0),
            rate: isOffline ? "Sensor asleep" : `${(latest.RainRate || 0).toFixed(1)} mm/hr`,
            total1h: `${(latest.Rainfall || 0).toFixed(1)}mm`,
          },
          node2: {
            level: isOffline ? "NO DATA" : parseFloat(latest.WaterLevel || 0).toFixed(2),
            label: isOffline ? "Sensor Asleep" : (latest.LevelLabel || "SAFE").toUpperCase(),
            status: isOffline ? "offline" : "online",
            lat: parseFloat(latest.Latitude || 0),
            lng: parseFloat(latest.Longitude || 0)
          },
          history: recentHistory,
          allLogs: allLogs, // <--- Save it to state
          lastUpdate: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          loading: false
        }));
      }
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return data;
}