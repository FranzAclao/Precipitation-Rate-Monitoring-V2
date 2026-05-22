import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

const DEFAULT_NODE_DEPTHS_CM = {
  node2: 55,
};

const ALLOWED_NODE_PATHS = ["Node1", "Node2"];

const DEFAULT_STATE = {
  rain: { intensity: "--", rate: 0, total1h: 0, status: "loading", source: "Detecting..." },
  node1: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null, maxLevel: null, fillRatio: 0 },
  node2: { level: 0, label: "SAFE", status: "loading", lat: 0, lng: 0, timestamp: null, maxLevel: null, fillRatio: 0 },
  nodes: [],
  history: [],
  node1History: [],
  node2History: [],
  allLogs: [],
  lastUpdate: "--",
  loading: true,
};

const LAT_KEYS = ["lat", "Lat", "LAT", "latitude", "Latitude"];
const LNG_KEYS = ["lng", "Lng", "LNG", "longitude", "Longitude", "lon", "Lon"];

function parseNumber(value, fallback = 0) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNodeId(nodeKey) {
  return String(nodeKey).toLowerCase().replace(/\s+/g, "");
}

function getTimestamp(entry) {
  return entry?.timestamp || entry?.Timestamp || null;
}

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function checkOffline(timestamp) {
  const sensorTime = toDate(timestamp);
  if (!sensorTime) return true;
  return (Date.now() - sensorTime.getTime()) / (1000 * 60) > 20;
}

function getRainIntensity(mm) {
  if (mm === 0) return "NO RAIN";
  if (mm < 2.5) return "LIGHT";
  if (mm < 7.6) return "MODERATE";
  if (mm < 50) return "HEAVY";
  return "VIOLENT";
}

function getRainRateValue(entry) {
  return parseNumber(entry?.rain_gauge?.processed?.rate_mm_per_hr ?? entry?.RainRate ?? 0);
}

function getRainfallValue(entry) {
  return parseNumber(entry?.rain_gauge?.processed?.total_mm ?? entry?.Rainfall ?? 0);
}

function getWaterLevelValue(entry) {
  return parseNumber(entry?.ultrasonic?.processed?.water_level_cm ?? entry?.WaterLevel ?? 0);
}

function getMaxWaterLevelValue(entry) {
  const value = entry?.ultrasonic?.processed?.max_water_level_cm;
  if (value === undefined || value === null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getLevelLabel(entry) {
  const label = entry?.level_label || entry?.alert_level || entry?.status_label || entry?.LevelLabel;
  return label ? String(label).toUpperCase() : null;
}

function deriveLevelLabel(entry) {
  const explicit = getLevelLabel(entry);
  if (explicit) return explicit;

  const level = getWaterLevelValue(entry);
  const maxLevel = getMaxWaterLevelValue(entry);
  if (!maxLevel || maxLevel <= 0) return "MONITORING";

  const fillRatio = level / maxLevel;
  if (fillRatio >= 0.85) return "DANGER";
  if (fillRatio >= 0.65) return "CAUTION";
  if (fillRatio >= 0.4) return "WATCH";
  return "SAFE";
}

function getCoord(entry, keys) {
  if (!entry) return 0;
  for (const key of keys) {
    const num = parseFloat(entry[key]);
    if (Number.isFinite(num) && num !== 0) return num;
  }
  return 0;
}

function toNodeDisplayName(nodeKey) {
  const match = /^node\s*(\d+)$/i.exec(String(nodeKey).trim());
  if (match) return `Sensor Node ${match[1]}`;
  return `Sensor ${nodeKey}`;
}

function getNodeDepthFallback(nodeKey) {
  if (!nodeKey) return null;
  return DEFAULT_NODE_DEPTHS_CM[toNodeId(nodeKey)] ?? null;
}

function buildLogEntry(entry, nodeKey) {
  const timestamp = getTimestamp(entry);
  const date = toDate(timestamp);
  if (!timestamp || !date) return null;

  return {
    timestamp,
    fullDate: timestamp.split(" ")[0],
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    rain: getRainRateValue(entry),
    level: getWaterLevelValue(entry),
    nodeId: toNodeId(nodeKey),
    nodeKey,
  };
}

function getNodeLogs(value, nodeKey) {
  if (!value) return [];
  return Object.values(value)
    .map((entry) => buildLogEntry(entry, nodeKey))
    .filter(Boolean);
}

function getLatestEntry(value) {
  if (!value) return null;
  const entries = Object.values(value).filter((entry) => toDate(getTimestamp(entry)));
  if (entries.length === 0) return null;
  entries.sort((a, b) => toDate(getTimestamp(a)) - toDate(getTimestamp(b)));
  return entries[entries.length - 1];
}

function createNodeSummary(nodeKey, latestEntry) {
  const timestamp = getTimestamp(latestEntry);
  const offline = checkOffline(timestamp);
  const level = getWaterLevelValue(latestEntry);
  const maxLevel = getMaxWaterLevelValue(latestEntry) ?? getNodeDepthFallback(nodeKey);
  const fillRatio = maxLevel ? Math.min(level / maxLevel, 1) : 0;

  return {
    id: nodeKey,
    key: nodeKey,
    displayName: toNodeDisplayName(nodeKey),
    level: offline ? "NO DATA" : level.toFixed(2),
    label: offline ? "Offline" : deriveLevelLabel(latestEntry),
    status: offline ? "offline" : "online",
    timestamp,
    lat: getCoord(latestEntry, LAT_KEYS),
    lng: getCoord(latestEntry, LNG_KEYS),
    rainRate: getRainRateValue(latestEntry),
    rainfall: getRainfallValue(latestEntry),
    maxLevel,
    fillRatio,
  };
}

function createPrimaryNodeState(nodeKey, latestEntry) {
  const timestamp = getTimestamp(latestEntry);
  const offline = checkOffline(timestamp);
  const level = getWaterLevelValue(latestEntry);
  const maxLevel = getMaxWaterLevelValue(latestEntry) ?? getNodeDepthFallback(nodeKey);

  return {
    level: offline ? "NO DATA" : level.toFixed(2),
    label: offline ? "Offline" : deriveLevelLabel(latestEntry),
    status: offline ? "offline" : "online",
    timestamp,
    lat: getCoord(latestEntry, LAT_KEYS),
    lng: getCoord(latestEntry, LNG_KEYS),
    maxLevel,
    fillRatio: maxLevel ? Math.min(level / maxLevel, 1) : 0,
  };
}

function buildHistory(logs) {
  return logs.slice(-12).map((entry) => ({ time: entry.time, rain: entry.rain, level: entry.level }));
}

function createRainState(rainSourceKey, latestByKey) {
  const rainNode = rainSourceKey ? latestByKey[rainSourceKey] : null;
  const rainRate = getRainRateValue(rainNode);
  const rainfall = getRainfallValue(rainNode);
  const sourceStatus = rainSourceKey
    ? (checkOffline(getTimestamp(rainNode)) ? `${rainSourceKey} Offline` : `${rainSourceKey} Active`)
    : "Detecting...";

  return {
    intensity: getRainIntensity(rainRate),
    rate: `${rainRate.toFixed(1)} mm/hr`,
    total1h: `${rainfall.toFixed(1)}mm`,
    source: sourceStatus,
  };
}

function buildFloodState(root) {
  const nodeKeys = Object.keys(root).filter((key) => /^node\s*\d+$/i.test(key));
  const logsByKey = {};
  const latestByKey = {};
  const nodes = [];

  for (const nodeKey of nodeKeys) {
    logsByKey[nodeKey] = getNodeLogs(root[nodeKey], nodeKey);
    latestByKey[nodeKey] = getLatestEntry(root[nodeKey]);
    nodes.push(createNodeSummary(nodeKey, latestByKey[nodeKey]));
  }

  const mergedLogs = Object.values(logsByKey)
    .flat()
    .sort((a, b) => toDate(a.timestamp) - toDate(b.timestamp));

  const node1Key = nodeKeys.find((key) => /^node\s*1$/i.test(key));
  const node2Key = nodeKeys.find((key) => /^node\s*2$/i.test(key));
  const rainSourceKey = node2Key || node1Key || nodeKeys[0] || null;

  const node1Logs = node1Key ? (logsByKey[node1Key] || []) : [];
  const node2Logs = node2Key ? (logsByKey[node2Key] || []) : [];

  return {
    ...DEFAULT_STATE,
    nodes,
    rain: createRainState(rainSourceKey, latestByKey),
    node1: createPrimaryNodeState(node1Key, node1Key ? latestByKey[node1Key] : null),
    node2: createPrimaryNodeState(node2Key, node2Key ? latestByKey[node2Key] : null),
    allLogs: mergedLogs,
    history: buildHistory(node2Logs),
    node1History: buildHistory(node1Logs),
    node2History: buildHistory(node2Logs),
    lastUpdate: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    loading: false,
  };
}

export function useFloodData() {
  const [data, setData] = useState(DEFAULT_STATE);

  useEffect(() => {
    const liveRoot = {};
    const unsubs = ALLOWED_NODE_PATHS.map((path) => {
      const nodeRef = ref(database, path);
      return onValue(
        nodeRef,
        (snap) => {
          liveRoot[path] = snap.val() || {};
          setData(buildFloodState({ ...liveRoot }));
        },
        (error) => {
          console.error(`RTDB read failed for ${path}:`, error?.code || error?.message || error);
          setData((prev) => ({
            ...prev,
            loading: false,
          }));
        }
      );
    });

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return data;
}
