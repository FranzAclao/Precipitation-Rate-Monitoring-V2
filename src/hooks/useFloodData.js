import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export function useFloodData() {
  const [data, setData] = useState({
    rain: { intensity: "--", rate: 0, total1h: 0, status: "loading", source: "Detecting..." },
    node1: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null },
    node2: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null },
    history: [],      
    node1History: [], 
    node2History: [], 
    allLogs: [],
    lastUpdate: "--",
    loading: true,
  });

  useEffect(() => {
    const node1Ref = ref(database, "Node1");
    const node2Ref = ref(database, "Node2");

    const checkOffline = (timestamp) => {
      if (!timestamp) return true;
      const sensorTime = new Date(timestamp.replace(" ", "T"));
      const now = new Date();
      return (now - sensorTime) / (1000 * 60) > 20;
    };

    const getRainIntensity = (mm) => {
      if (mm === 0) return "NO RAIN";
      if (mm < 2.5) return "LIGHT";
      if (mm < 7.6) return "MODERATE";
      if (mm < 50) return "HEAVY";
      return "VIOLENT";
    };

    // Shared storage to merge data from both listeners
    let logCache = { node1: [], node2: [] };
    let latestSensors = { n1: null, n2: null };

    const updateMasterState = () => {
      const n1 = latestSensors.n1 || { Timestamp: null, WaterLevel: 0, RainRate: 0 };
      const n2 = latestSensors.n2 || { Timestamp: null, WaterLevel: 0, RainRate: 0 };

      const n1Offline = checkOffline(n1.Timestamp);
      const n2Offline = checkOffline(n2.Timestamp);

      // Merge and Sort Logs chronologically
      const mergedLogs = [...logCache.node1, ...logCache.node2]
        .sort((a, b) => new Date(a.timestamp.replace(" ","T")) - new Date(b.timestamp.replace(" ","T")));

      setData(prev => ({
        ...prev,
        rain: {
          intensity: getRainIntensity(parseFloat(n2.RainRate || 0)),
          rate: `${parseFloat(n2.RainRate || 0).toFixed(1)} mm/hr`,
          total1h: `${parseFloat(n2.Rainfall || 0).toFixed(1)}mm`,
          source: n2Offline ? "Node 1 Only" : "Node 2 Active"
        },
        node1: {
          level: n1Offline ? "NO DATA" : parseFloat(n1.WaterLevel || 0).toFixed(2),
          label: n1Offline ? "Offline" : (n1.LevelLabel || "SAFE").toUpperCase(),
          status: n1Offline ? "offline" : "online",
          timestamp: n1.Timestamp
        },
        node2: {
          level: n2Offline ? "NO DATA" : parseFloat(n2.WaterLevel || 0).toFixed(2),
          label: n2Offline ? "Offline" : (n2.LevelLabel || "SAFE").toUpperCase(),
          status: n2Offline ? "offline" : "online",
          timestamp: n2.Timestamp
        },
        allLogs: mergedLogs,
        history: logCache.node2.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        node1History: logCache.node1.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        node2History: logCache.node2.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        lastUpdate: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        loading: false
      }));
    };

    const processSnapshot = (val, nodeId) => {
      if (!val) return [];
      return Object.values(val).map(v => ({
        timestamp: v.Timestamp,
        fullDate: v.Timestamp.split(" ")[0],
        time: new Date(v.Timestamp.replace(" ", "T")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rain: parseFloat(v.RainRate || 0), // Standardizing property name to 'rain'
        level: parseFloat(v.WaterLevel || 0),
        nodeId
      }));
    };

    const unsub1 = onValue(node1Ref, (snap) => {
      const val = snap.val();
      if (val) {
        logCache.node1 = processSnapshot(val, 'node1');
        const entries = Object.values(val).sort((a, b) => new Date(a.Timestamp.replace(" ","T")) - new Date(b.Timestamp.replace(" ","T")));
        latestSensors.n1 = entries[entries.length - 1];
      }
      updateMasterState();
    });

    const unsub2 = onValue(node2Ref, (snap) => {
      const val = snap.val();
      if (val) {
        logCache.node2 = processSnapshot(val, 'node2');
        const entries = Object.values(val).sort((a, b) => new Date(a.Timestamp.replace(" ","T")) - new Date(b.Timestamp.replace(" ","T")));
        latestSensors.n2 = entries[entries.length - 1];
      }
      updateMasterState();
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return data;
}