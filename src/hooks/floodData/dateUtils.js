import { MAX_FUTURE_SKEW_MINUTES, OFFLINE_AFTER_MINUTES } from "./constants";

export function parseDateInput(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return String(value).trim();
}

export function toCandidateDates(value) {
  const input = parseDateInput(value);
  if (!input) return [];
  if (input instanceof Date) return [input];

  const candidates = [];
  const pushDate = (dateValue) => {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return;
    if (!candidates.some((candidate) => candidate.getTime() === dateValue.getTime())) {
      candidates.push(dateValue);
    }
  };

  pushDate(new Date(input));

  const normalized = input.replace(" ", "T");
  pushDate(new Date(normalized));

  const localLikeMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (localLikeMatch) {
    const [, year, month, day, hour, minute, second = "00"] = localLikeMatch;
    pushDate(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
    pushDate(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))));
  }

  return candidates;
}

export function toDate(value) {
  return toCandidateDates(value)[0] || null;
}

export function isTimestampFresh(timestamp) {
  const sensorTimes = toCandidateDates(timestamp);
  if (sensorTimes.length === 0) return false;

  return sensorTimes.some((sensorTime) => {
    const diffMinutes = (Date.now() - sensorTime.getTime()) / (1000 * 60);
    if (diffMinutes < -MAX_FUTURE_SKEW_MINUTES) return false;
    return diffMinutes <= OFFLINE_AFTER_MINUTES;
  });
}

export function checkOffline(timestamp) {
  return !isTimestampFresh(timestamp);
}

export function formatStatusTimestamp(timestamp) {
  return timestamp ? String(timestamp) : null;
}
