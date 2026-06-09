export const DEFAULT_NODE_DEPTHS_CM = {
  node2: 55,
};

export const HARDCODED_NODE_COORDS = {
  node1: { lat: 8.2327, lng: 124.2594 }, // 8°13'57.57"N 124°15'33.99"E
  node2: { lat: 8.2345, lng: 124.2525 }, // 8°14'04.33"N 124°15'08.85"E
};

export const ALLOWED_NODE_PATHS = ["Node1", "Node2"];

export const DEFAULT_STATE = {
  rain: { intensity: "--", rate: "0 mm/hr", total1h: "0 mm", status: "loading", source: "Detecting..." },
  system: { mode: "LIVE", label: "Detecting...", subtitle: "Waiting for telemetry", sendReason: null, timestamp: null, details: [] },
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

export const LAT_KEYS = ["lat", "Lat", "LAT", "latitude", "Latitude"];
export const LNG_KEYS = ["lng", "Lng", "LNG", "longitude", "Longitude", "lon", "Lon"];
export const OFFLINE_AFTER_MINUTES = 20;
export const MAX_FUTURE_SKEW_MINUTES = 10;
