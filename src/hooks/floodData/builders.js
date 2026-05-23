import { DEFAULT_NODE_DEPTHS_CM, DEFAULT_STATE, LAT_KEYS, LNG_KEYS } from "./constants";
import { checkOffline, formatStatusTimestamp, toDate } from "./dateUtils";
import {
  getCoord,
  getLevelLabel,
  getMaxWaterLevelValue,
  getRainRateValue,
  getRainfallValue,
  getRainingValue,
  getSendReason,
  getTimestamp,
  getWaterLevelValue,
} from "./telemetryGetters";

export function getRainIntensity(mm) {
  if (mm === 0) return "NO RAIN";
  if (mm < 2.5) return "LIGHT";
  if (mm < 7.6) return "MODERATE";
  if (mm < 50) return "HEAVY";
  return "VIOLENT";
}

export function toNodeId(nodeKey) {
  return String(nodeKey).toLowerCase().replace(/\s+/g, "");
}

export function deriveLevelLabel(entry) {
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

export function toNodeDisplayName(nodeKey) {
  const match = /^node\s*(\d+)$/i.exec(String(nodeKey).trim());
  if (match) return `Sensor Node ${match[1]}`;
  return `Sensor ${nodeKey}`;
}

export function toShortNodeName(nodeKey) {
  const match = /^node\s*(\d+)$/i.exec(String(nodeKey || "").trim());
  if (match) return `N${match[1]}`;
  return String(nodeKey || "").toUpperCase();
}

export function getNodeDepthFallback(nodeKey) {
  if (!nodeKey) return null;
  return DEFAULT_NODE_DEPTHS_CM[toNodeId(nodeKey)] ?? null;
}

export function buildLogEntry(entry, nodeKey) {
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

export function isTelemetrySnapshot(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Boolean(getTimestamp(value));
}

export function getNodeLogs(value, nodeKey) {
  if (!value) return [];
  if (isTelemetrySnapshot(value)) {
    const log = buildLogEntry(value, nodeKey);
    return log ? [log] : [];
  }
  return Object.values(value)
    .map((entry) => buildLogEntry(entry, nodeKey))
    .filter(Boolean);
}

export function getLatestEntry(value) {
  if (!value) return null;
  if (isTelemetrySnapshot(value)) return value;
  const entries = Object.values(value).filter((entry) => toDate(getTimestamp(entry)));
  if (entries.length === 0) return null;
  entries.sort((a, b) => toDate(getTimestamp(a)) - toDate(getTimestamp(b)));
  return entries[entries.length - 1];
}

export function createNodeSummary(nodeKey, latestEntry) {
  const timestamp = getTimestamp(latestEntry);
  const offline = !latestEntry || checkOffline(timestamp);
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

export function createPrimaryNodeState(nodeKey, latestEntry) {
  const timestamp = getTimestamp(latestEntry);
  const offline = !latestEntry || checkOffline(timestamp);
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

export function buildHistory(logs) {
  return logs.slice(-12).map((entry) => ({ time: entry.time, rain: entry.rain, level: entry.level }));
}

export function createRainState(rainSourceKey, latestByKey) {
  const preferredKeys = [
    rainSourceKey,
    ...Object.keys(latestByKey).filter((key) => key !== rainSourceKey),
  ].filter(Boolean);

  const candidates = preferredKeys
    .map((nodeKey) => {
      const entry = latestByKey[nodeKey];
      if (!entry) return null;

      const timestamp = getTimestamp(entry);
      return {
        nodeKey,
        entry,
        offline: checkOffline(timestamp),
        sendReason: getSendReason(entry),
        rainRate: getRainRateValue(entry),
        rainfall: getRainfallValue(entry),
        isRaining: getRainingValue(entry),
      };
    })
    .filter(Boolean);

  const onlineCandidates = candidates.filter((item) => !item.offline);
  const activeCandidate = onlineCandidates.find((item) => {
    if (item.isRaining) return true;
    if (item.sendReason === "rain_event" || item.sendReason === "periodic_wet") return true;
    return false;
  });
  const primaryOnlineCandidate = activeCandidate || onlineCandidates[0];

  if (!primaryOnlineCandidate) {
    return {
      intensity: "Offline",
      rate: "No Data",
      total1h: "No Data",
      status: "offline",
      source: candidates.length > 0 ? "All nodes offline" : "Waiting for telemetry",
    };
  }

  if (!activeCandidate) {
    const primaryReason = primaryOnlineCandidate.sendReason;
    const source =
      primaryReason === "periodic_dry_window" ? "Post-rain monitoring"
        : primaryReason === "heartbeat_dry" ? "Dry conditions"
          : `${primaryOnlineCandidate.nodeKey} Online`;

    return {
      intensity: "No Rain",
      rate: "0 mm/hr",
      total1h: "0 mm",
      status: "inactive",
      source,
    };
  }

  return {
    intensity: getRainIntensity(activeCandidate.rainRate),
    rate: `${activeCandidate.rainRate.toFixed(1)} mm/hr`,
    total1h: `${activeCandidate.rainfall.toFixed(1)} mm`,
    status: "active",
    source: `${activeCandidate.nodeKey} Active`,
  };
}

export function getSendReasonLabel(reason) {
  if (reason === "heartbeat_boot") return "System started";
  if (reason === "heartbeat_dry") return "Dry conditions";
  if (reason === "rain_event") return "Rain started";
  if (reason === "periodic_wet") return "Rain ongoing";
  if (reason === "periodic_dry_window") return "Post-rain monitoring";
  return "Telemetry live";
}

export function createSystemState(systemNodeKeys, latestByKey) {
  const details = (systemNodeKeys || [])
    .map((nodeKey) => {
      const entry = latestByKey[nodeKey];
      const timestamp = getTimestamp(entry);
      const sendReason = getSendReason(entry);
      return {
        nodeKey,
        entry,
        timestamp,
        sendReason,
        offline: !entry || checkOffline(timestamp),
      };
    })
    .filter((item) => item.entry);

  if (details.length === 0) {
    return {
      mode: "LIVE",
      label: "Offline",
      subtitle: "No recent telemetry",
      sendReason: null,
      timestamp: null,
      details: [],
    };
  }

  const sortedDetails = [...details].sort((a, b) => {
    const aTime = toDate(a.timestamp)?.getTime() ?? 0;
    const bTime = toDate(b.timestamp)?.getTime() ?? 0;
    return bTime - aTime;
  });

  const primary = sortedDetails.find((item) => !item.offline) || sortedDetails[0];
  const primaryTimestamp = formatStatusTimestamp(primary.timestamp);
  const perNodeSummary = sortedDetails
    .map((item) => {
      const label = item.offline ? "Offline" : getSendReasonLabel(item.sendReason);
      const timestamp = formatStatusTimestamp(item.timestamp);
      return `${toShortNodeName(item.nodeKey)} ${label}${timestamp ? ` ${timestamp}` : ""}`;
    })
    .join(" | ");

  return {
    mode: "LIVE",
    label: primary.offline ? "Offline" : getSendReasonLabel(primary.sendReason),
    subtitle: perNodeSummary || (primaryTimestamp || "No recent telemetry"),
    sendReason: primary.sendReason,
    timestamp: primary.timestamp,
    details: sortedDetails,
  };
}

export function buildFloodState(root) {
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
  const systemNodeKeys = [node1Key, node2Key].filter(Boolean);

  const node1Logs = node1Key ? (logsByKey[node1Key] || []) : [];
  const node2Logs = node2Key ? (logsByKey[node2Key] || []) : [];

  return {
    ...DEFAULT_STATE,
    nodes,
    rain: createRainState(rainSourceKey, latestByKey),
    system: createSystemState(systemNodeKeys.length ? systemNodeKeys : nodeKeys, latestByKey),
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
