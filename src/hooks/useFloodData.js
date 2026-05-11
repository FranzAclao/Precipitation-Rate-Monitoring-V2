import { useState, useEffect, useMemo, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export function useFloodData() {
  const [data, setData] = useState({
    rain: { intensity: "--", rate: 0, total1h: 0, status: "loading", source: "Detecting..." },
    node1: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null },
    node2: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null },
    nodes: [],
    history: [],
    node1History: [],
    node2History: [],
    allLogs: [],
    lastUpdate: "--",
    loading: true,
  });

  // Memoize expensive functions to prevent recreation on every render
  const checkOffline = useCallback((timestamp) => {
    if (!timestamp) return true;
    const sensorTime = new Date(timestamp.replace(" ", "T"));
    const now = new Date();
    return (now - sensorTime) / (1000 * 60) > 20;
  }, []);

  const getRainIntensity = useCallback((mm) => {
    if (mm === 0) return "NO RAIN";
    if (mm < 2.5) return "LIGHT";
    if (mm < 7.6) return "MODERATE";
    if (mm < 50) return "HEAVY";
    return "VIOLENT";
  }, []);

  const processSnapshot = useCallback((val, nodeKey) => {
    if (!val) return [];
    const nodeId = String(nodeKey).toLowerCase().replace(/\s+/g, "");
    return Object.values(val)
      .filter(v => v && v.Timestamp)
      .map(v => ({
        timestamp: v.Timestamp,
        fullDate: v.Timestamp.split(" ")[0],
        time: new Date(v.Timestamp.replace(" ", "T")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rain: parseFloat(v.RainRate || 0),
        level: parseFloat(v.WaterLevel || 0),
        nodeId,
        nodeKey
      }));
  }, []);

  const getLatestEntry = useCallback((val) => {
    if (!val) return null;
    const entries = Object.values(val).filter(v => v && v.Timestamp);
    if (entries.length === 0) return null;
    entries.sort((a, b) => new Date(a.Timestamp.replace(" ", "T")) - new Date(b.Timestamp.replace(" ", "T")));
    return entries[entries.length - 1];
  }, []);

  const getCoord = useCallback((entry, keys) => {
    if (!entry) return 0;
    for (const key of keys) {
      const raw = entry[key];
      const num = raw === undefined || raw === null ? NaN : parseFloat(raw);
      if (!Number.isNaN(num) && num !== 0) return num;
    }
    return 0;
  }, []);

  const toNodeDisplayName = useCallback((nodeKey) => {
    const match = /^node\s*(\d+)$/i.exec(String(nodeKey).trim());
    if (match) return `Sensor Node ${match[1]}`;
    return `Sensor ${nodeKey}`;
  }, []);

  useEffect(() => {
    const rootRef = ref(database);
    const unsub = onValue(rootRef, (snap) => {
      const root = snap.val() || {};
      const keys = Object.keys(root);
      const nodeKeys = keys.filter(k => /^node\s*\d+$/i.test(k));

      // Use useMemo-like optimization by computing only what's needed
      const logsByKey = {};
      const latestByKey = {};
      const nodes = [];

      for (const nodeKey of nodeKeys) {
        const val = root[nodeKey];
        logsByKey[nodeKey] = processSnapshot(val, nodeKey);
        latestByKey[nodeKey] = getLatestEntry(val);

        const latest = latestByKey[nodeKey];
        const isOffline = checkOffline(latest?.Timestamp);

        nodes.push({
          id: nodeKey,
          key: nodeKey,
          displayName: toNodeDisplayName(nodeKey),
          level: isOffline ? "NO DATA" : parseFloat(latest?.WaterLevel || 0).toFixed(2),
          label: isOffline ? "Offline" : (latest?.LevelLabel || "SAFE").toUpperCase(),
          status: isOffline ? "offline" : "online",
          timestamp: latest?.Timestamp || null,
          lat: getCoord(latest, ["lat", "Lat", "LAT", "latitude", "Latitude"]),
          lng: getCoord(latest, ["lng", "Lng", "LNG", "longitude", "Longitude", "lon", "Lon"]),
          rainRate: parseFloat(latest?.RainRate || 0),
          rainfall: parseFloat(latest?.Rainfall || 0),
        });
      }

      // Optimize: Only sort if we have new data
      const mergedLogs = Object.values(logsByKey)
        .flat()
        .sort((a, b) => new Date(a.timestamp.replace(" ", "T")) - new Date(b.timestamp.replace(" ", "T")));

      const node1Key = nodeKeys.find(k => /^node\s*1$/i.test(k));
      const node2Key = nodeKeys.find(k => /^node\s*2$/i.test(k));

      const node1Latest = node1Key ? latestByKey[node1Key] : null;
      const node2Latest = node2Key ? latestByKey[node2Key] : null;

      const node1Offline = checkOffline(node1Latest?.Timestamp);
      const node2Offline = checkOffline(node2Latest?.Timestamp);

      const rainSourceKey = node2Key || node1Key || nodeKeys[0] || null;
      const rainNode = rainSourceKey ? latestByKey[rainSourceKey] : null;
      const rainNodeOffline = checkOffline(rainNode?.Timestamp);

      const node1Logs = node1Key ? (logsByKey[node1Key] || []) : [];
      const node2Logs = node2Key ? (logsByKey[node2Key] || []) : [];

      setData(prev => ({
        ...prev,
        nodes,
        rain: {
          intensity: getRainIntensity(parseFloat(rainNode?.RainRate || 0)),
          rate: `${parseFloat(rainNode?.RainRate || 0).toFixed(1)} mm/hr`,
          total1h: `${parseFloat(rainNode?.Rainfall || 0).toFixed(1)}mm`,
          source: rainSourceKey
            ? (rainNodeOffline ? `${rainSourceKey} Offline` : `${rainSourceKey} Active`)
            : "Detecting..."
        },
        node1: {
          level: node1Offline ? "NO DATA" : parseFloat(node1Latest?.WaterLevel || 0).toFixed(2),
          label: node1Offline ? "Offline" : (node1Latest?.LevelLabel || "SAFE").toUpperCase(),
          status: node1Offline ? "offline" : "online",
          timestamp: node1Latest?.Timestamp || null,
          lat: getCoord(node1Latest, ["lat", "Lat", "LAT", "latitude", "Latitude"]),
          lng: getCoord(node1Latest, ["lng", "Lng", "LNG", "longitude", "Longitude", "lon", "Lon"]),
        },
        node2: {
          level: node2Offline ? "NO DATA" : parseFloat(node2Latest?.WaterLevel || 0).toFixed(2),
          label: node2Offline ? "Offline" : (node2Latest?.LevelLabel || "SAFE").toUpperCase(),
          status: node2Offline ? "offline" : "online",
          timestamp: node2Latest?.Timestamp || null,
          lat: getCoord(node2Latest, ["lat", "Lat", "LAT", "latitude", "Latitude"]),
          lng: getCoord(node2Latest, ["lng", "Lng", "LNG", "longitude", "Longitude", "lon", "Lon"]),
        },
        allLogs: mergedLogs,
        history: node2Logs.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        node1History: node1Logs.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        node2History: node2Logs.slice(-12).map(e => ({ time: e.time, rain: e.rain })),
        lastUpdate: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        loading: false
      }));
    });

    return () => { unsub(); };
  }, [checkOffline, getRainIntensity, processSnapshot, getLatestEntry, getCoord, toNodeDisplayName]);

  return data;
}
