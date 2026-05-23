function parseNumber(value, fallback = 0) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getTimestamp(entry) {
  return entry?.timestamp || entry?.Timestamp || null;
}

export function getSendReason(entry) {
  return entry?.send_reason || entry?.sendReason || null;
}

export function getRainRateValue(entry) {
  return parseNumber(entry?.rain_gauge?.processed?.rate_mm_per_hr ?? entry?.RainRate ?? 0);
}

export function getRainfallValue(entry) {
  return parseNumber(entry?.rain_gauge?.processed?.total_mm ?? entry?.Rainfall ?? 0);
}

export function getWaterLevelValue(entry) {
  return parseNumber(entry?.ultrasonic?.processed?.water_level_cm ?? entry?.WaterLevel ?? 0);
}

export function getRainingValue(entry) {
  return Boolean(entry?.rain_gauge?.raw?.is_raining);
}

export function getUltrasonicValid(entry) {
  const value = entry?.ultrasonic?.raw?.valid;
  return typeof value === "boolean" ? value : null;
}

export function getMaxWaterLevelValue(entry) {
  const value = entry?.ultrasonic?.processed?.max_water_level_cm;
  if (value === undefined || value === null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getLevelLabel(entry) {
  const label = entry?.level_label || entry?.alert_level || entry?.status_label || entry?.LevelLabel;
  return label ? String(label).toUpperCase() : null;
}

export function getCoord(entry, keys) {
  if (!entry) return 0;
  for (const key of keys) {
    const num = parseFloat(entry[key]);
    if (Number.isFinite(num) && num !== 0) return num;
  }
  return 0;
}
