import React, { useId } from "react";

const STATUS_STYLES = {
  safe: {
    water: "#22c55e",
    waterSoft: "#86efac",
    surface: "#dcfce7",
    marker: "#16a34a",
  },
  watch: {
    water: "#eab308",
    waterSoft: "#fde047",
    surface: "#fef08a",
    marker: "#ca8a04",
  },
  caution: {
    water: "#f97316",
    waterSoft: "#fdba74",
    surface: "#fed7aa",
    marker: "#ea580c",
  },
  "flood-risk": {
    water: "#ef4444",
    waterSoft: "#fca5a5",
    surface: "#fecaca",
    marker: "#dc2626",
  },
  "no-data": {
    water: "#cbd5e1",
    waterSoft: "#e2e8f0",
    surface: "#e5e7eb",
    marker: "#94a3b8",
  },
};

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFillRatio(level, maxLevel, hasData) {
  if (!hasData) return 0;
  const current = toNumber(level);
  const limit = toNumber(maxLevel);
  if (current === null || limit === null || limit <= 0) return 0.08;
  return Math.min(Math.max(current / limit, 0.08), 1);
}

function formatMarkerLabel(level, maxLevel) {
  const current = toNumber(level);
  if (current === null) return "NO DATA";
  const unit = toNumber(maxLevel) && toNumber(maxLevel) > 10 ? "cm" : "m";
  return `${current.toFixed(2)} ${unit}`;
}

export default function CanalSvg({ level, maxLevel, status, hasData }) {
  const ids = useId().replace(/:/g, "");
  const canalId = `canal-${ids}`;
  const waterId = `water-${ids}`;
  const waveId = `wave-${ids}`;
  const normalizedStatus = hasData ? status : "no-data";
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES["no-data"];
  const current = toNumber(level);
  const limit = toNumber(maxLevel);
  const fillRatio = getFillRatio(level, maxLevel, hasData);
  const waterTop = 190 - (fillRatio * 132);
  const markerY = waterTop;
  const thresholdLevel = limit && limit > 0 ? 47 : null;
  const thresholdRatio = thresholdLevel && limit ? Math.min(thresholdLevel / limit, 1) : null;
  const thresholdY = thresholdRatio !== null ? 190 - (thresholdRatio * 132) : null;
  const exceedsDisplayRange = hasData && current !== null && limit !== null && current > limit;

  return (
    <svg className="h-full w-full" viewBox="0 0 420 260" preserveAspectRatio="none" role="img" aria-label="Canal water level visualization">
      <defs>
        <linearGradient id={canalId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={style.waterSoft} />
          <stop offset="100%" stopColor={style.water} />
        </linearGradient>
        <clipPath id={waveId}>
          <path d="M106 58 L314 58 L286 190 L134 190 Z" />
        </clipPath>
      </defs>

      <rect width="420" height="260" fill="transparent" />

      <path d="M80 42 L124 212 L296 212 L340 42 L320 42 L286 190 L134 190 L100 42 Z" fill={`url(#${canalId})`} />
      <path d="M112 58 L136 190 L284 190 L308 58" fill="#f8fafc" opacity="0.7" />
      <path d="M128 190 L292 190 L300 212 L120 212 Z" fill="#94a3b8" opacity="0.32" />
      <path d="M88 42 L124 212 L296 212 L332 42" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M124 212 L296 212" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
      <path d="M104 58 L314 58" fill="none" stroke="#e2e8f0" strokeWidth="3" opacity="0.8" />
      <path d="M140 96 L129 148" fill="none" stroke="#cbd5e1" strokeWidth="4" opacity="0.35" strokeLinecap="round" />
      <path d="M280 96 L291 148" fill="none" stroke="#cbd5e1" strokeWidth="4" opacity="0.35" strokeLinecap="round" />

      {hasData ? (
        <g clipPath={`url(#${waveId})`}>
          <rect x="92" y={waterTop} width="236" height={190 - waterTop} fill={`url(#${waterId})`} opacity="0.96" />
          <path d={`M92 ${waterTop + 2} C118 ${waterTop - 8} 144 ${waterTop - 8} 170 ${waterTop + 2} C196 ${waterTop + 12} 222 ${waterTop + 12} 248 ${waterTop + 2} C274 ${waterTop - 8} 300 ${waterTop - 8} 326 ${waterTop + 2} L326 190 L92 190 Z`} fill={style.surface} fillOpacity="0.62">
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-22 0" dur="7s" repeatCount="indefinite" />
          </path>
          <path d={`M96 ${waterTop + 7} C124 ${waterTop - 1} 152 ${waterTop - 1} 180 ${waterTop + 7} C208 ${waterTop + 15} 236 ${waterTop + 15} 264 ${waterTop + 7} C292 ${waterTop - 1} 320 ${waterTop - 1} 348 ${waterTop + 7}`} fill="none" stroke="#ffffff" strokeOpacity="0.42" strokeWidth="2.5">
            <animateTransform attributeName="transform" type="translate" from="-16 0" to="12 0" dur="9s" repeatCount="indefinite" />
          </path>
          {exceedsDisplayRange && (
            <>
              <path d="M100 50 C126 38 150 38 174 50 C198 62 222 62 246 50 C270 38 294 38 318 50" fill="none" stroke={style.marker} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.85" />
              <path d="M108 40 L120 28 M160 38 L172 22 M214 38 L226 24 M268 40 L280 26" fill="none" stroke={style.marker} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
            </>
          )}
        </g>
      ) : (
        <g clipPath={`url(#${waveId})`}>
          <path d="M100 58 L320 58 L286 190 L134 190 Z" fill="#e2e8f0" fillOpacity="0.34" />
          <circle cx="210" cy="112" r="16" fill="none" stroke="#94a3b8" strokeWidth="3" strokeOpacity="0.8" />
          <path d="M199 123 L221 101" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
          <text x="210" y="148" textAnchor="middle" fontSize="16" fontWeight="800" fill="#64748b" letterSpacing="0.8">
            No live reading
          </text>
          <text x="210" y="168" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" letterSpacing="1">
            Awaiting telemetry
          </text>
        </g>
      )}

      {hasData && thresholdY !== null && (
        <g>
          <line x1="112" y1={thresholdY} x2="308" y2={thresholdY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 5" strokeOpacity="0.65" />
          <rect x="118" y={thresholdY - 18} width="72" height="18" rx="9" fill="#ffffff" fillOpacity="0.96" stroke="#fecaca" />
          <text x="154" y={thresholdY - 5} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b91c1c">
            Flood 47 cm
          </text>
        </g>
      )}

      {exceedsDisplayRange && (
        <g>
          <rect x="228" y="20" width="132" height="24" rx="12" fill="#7f1d1d" fillOpacity="0.96" />
          <text x="294" y="35" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#ffffff">
            Above display range
          </text>
        </g>
      )}

      {hasData && (
        <g transform={`translate(276 ${markerY})`}>
          <line x1="0" y1="0" x2="24" y2="0" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="30" cy="0" r="7" fill={style.marker} stroke="#ffffff" strokeWidth="3" />
          <rect x="42" y="-14" width="92" height="28" rx="14" fill="#ffffff" fillOpacity="0.98" stroke="#cbd5e1" />
          <text x="88" y="5" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#334155">
            {formatMarkerLabel(level, maxLevel)}
          </text>
        </g>
      )}
    </svg>
  );
}
