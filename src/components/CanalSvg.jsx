import React, { useId } from "react";

const STATUS_STYLES = {
  safe: {
    water: "#38bdf8",
    waterSoft: "#dbeafe",
    line: "#0284c7",
    badge: "#0369a1",
  },
  watch: {
    water: "#facc15",
    waterSoft: "#fef3c7",
    line: "#ca8a04",
    badge: "#a16207",
  },
  caution: {
    water: "#fb923c",
    waterSoft: "#ffedd5",
    line: "#ea580c",
    badge: "#c2410c",
  },
  "flood-risk": {
    water: "#f87171",
    waterSoft: "#fecaca",
    line: "#dc2626",
    badge: "#991b1b",
  },
  "no-data": {
    water: "#cbd5e1",
    waterSoft: "#e2e8f0",
    line: "#64748b",
    badge: "#475569",
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

function getUnit(maxLevel) {
  return toNumber(maxLevel) && toNumber(maxLevel) > 10 ? "cm" : "m";
}

function formatValue(value, unit, digits = 2) {
  const numeric = toNumber(value);
  if (numeric === null) return "--";
  return `${numeric.toFixed(digits)} ${unit}`;
}

function getScaleTicks(limit) {
  const max = toNumber(limit) || 55;
  const ticks = [];
  for (let value = 0; value <= max; value += 5) {
    ticks.push({
      value,
      ratio: max > 0 ? value / max : 0,
    });
  }
  if (ticks[ticks.length - 1]?.value !== max) {
    ticks.push({
      value: max,
      ratio: 1,
    });
  }
  return ticks;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function CanalSvg({ level, maxLevel, status, hasData, thresholdLevel = 47 }) {
  const ids = useId().replace(/:/g, "");
  const clipId = `canal-water-${ids}`;
  const wavePrimaryId = `canal-wave-primary-${ids}`;
  const waveSecondaryId = `canal-wave-secondary-${ids}`;
  const normalizedStatus = hasData ? status : "no-data";
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES["no-data"];
  const unit = getUnit(maxLevel);
  const current = toNumber(level);
  const limit = toNumber(maxLevel) || 55;
  const exceedsScale = hasData && current !== null && current > limit;
  const fillRatio = getFillRatio(level, maxLevel, hasData);

  const basinTopY = 68;
  const basinBottomY = 170;
  const basinTopLeftX = 152;
  const basinTopRightX = 274;
  const basinBottomLeftX = 176;
  const basinBottomRightX = 250;
  const wallOuterTopLeftX = 126;
  const wallOuterTopRightX = 300;
  const wallOuterBottomLeftX = 160;
  const wallOuterBottomRightX = 266;
  const wallBottomY = 186;

  const displayWaterTop = basinBottomY - (fillRatio * (basinBottomY - basinTopY));
  const waterTopY = exceedsScale ? basinTopY : displayWaterTop;
  const thresholdRatio = limit > 0 ? Math.min(thresholdLevel / limit, 1) : 0;
  const thresholdY = basinBottomY - (thresholdRatio * (basinBottomY - basinTopY));

  const basinXAtY = (y) => {
    const progress = clamp((y - basinTopY) / (basinBottomY - basinTopY), 0, 1);
    return {
      left: basinTopLeftX + ((basinBottomLeftX - basinTopLeftX) * progress),
      right: basinTopRightX + ((basinBottomRightX - basinTopRightX) * progress),
    };
  };

  const waterBounds = basinXAtY(waterTopY);

  return (
    <svg className="h-full w-full" viewBox="0 0 420 220" preserveAspectRatio="none" role="img" aria-label="Canal water level cross-section">
      <defs>
        <clipPath id={clipId}>
          <path d={`M ${basinTopLeftX} ${basinTopY} L ${basinTopRightX} ${basinTopY} L ${basinBottomRightX} ${basinBottomY} L ${basinBottomLeftX} ${basinBottomY} Z`} />
        </clipPath>
      </defs>

      <rect x="16" y="14" width="388" height="192" rx="18" fill="rgba(255,255,255,0.42)" stroke="#dbe4ef" />

      {getScaleTicks(limit).map((item) => {
        const y = basinBottomY - (item.ratio * (basinBottomY - basinTopY));
        return (
          <g key={`${item.value}-${y}`}>
            <line x1="56" y1={y} x2="68" y2={y} stroke="#94a3b8" strokeWidth="1.25" />
            <line x1="76" y1={y} x2="324" y2={y} stroke="#e2e8f0" strokeWidth="0.9" strokeDasharray="2 7" />
            <text x="44" y={y + 3.5} textAnchor="end" fontSize="8.5" fontWeight="800" fill="#64748b">
              {item.value}
            </text>
          </g>
        );
      })}

      <g>
        <path d={`M ${wallOuterTopLeftX} 54 L ${basinTopLeftX} ${basinTopY} L ${basinBottomLeftX} ${basinBottomY} L ${wallOuterBottomLeftX} ${wallBottomY} Z`} fill="#dbe4ef" />
        <path d={`M ${basinTopRightX} ${basinTopY} L ${wallOuterTopRightX} 54 L ${wallOuterBottomRightX} ${wallBottomY} L ${basinBottomRightX} ${basinBottomY} Z`} fill="#dbe4ef" />
        <path d={`M ${wallOuterBottomLeftX} ${wallBottomY} L ${wallOuterBottomRightX} ${wallBottomY} L ${basinBottomRightX} ${basinBottomY} L ${basinBottomLeftX} ${basinBottomY} Z`} fill="#cbd5e1" />

        <path d={`M ${basinTopLeftX} ${basinTopY} L ${basinBottomLeftX} ${basinBottomY}`} fill="none" stroke="#334155" strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M ${basinTopRightX} ${basinTopY} L ${basinBottomRightX} ${basinBottomY}`} fill="none" stroke="#334155" strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M ${basinBottomLeftX} ${basinBottomY} L ${basinBottomRightX} ${basinBottomY}`} fill="none" stroke="#334155" strokeWidth="4.8" strokeLinecap="round" />
        <path d={`M ${wallOuterTopLeftX} 54 L ${basinTopLeftX} ${basinTopY}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <path d={`M ${basinTopRightX} ${basinTopY} L ${wallOuterTopRightX} 54`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </g>

      {hasData ? (
        <>
          <g clipPath={`url(#${clipId})`}>
            <rect x={basinTopLeftX - 12} y={waterTopY} width={(basinTopRightX - basinTopLeftX) + 24} height={basinBottomY - waterTopY + 6} fill={style.water} fillOpacity="0.84" />
            <path
              id={wavePrimaryId}
              d={`M ${waterBounds.left - 10} ${waterTopY + 2} C ${waterBounds.left + 10} ${waterTopY - 5} ${waterBounds.left + 30} ${waterTopY - 5} ${waterBounds.left + 50} ${waterTopY + 2} C ${waterBounds.left + 72} ${waterTopY + 9} ${waterBounds.left + 94} ${waterTopY + 9} ${waterBounds.left + 116} ${waterTopY + 2} C ${waterBounds.left + 132} ${waterTopY - 3} ${waterBounds.left + 146} ${waterTopY - 3} ${waterBounds.right + 10} ${waterTopY + 2} L ${waterBounds.right + 12} ${basinBottomY + 4} L ${waterBounds.left - 12} ${basinBottomY + 4} Z`}
              fill="#ffffff"
              fillOpacity="0.1"
            />
            <animateTransform href={`#${wavePrimaryId}`} attributeName="transform" type="translate" values="-5 0; 5 0; -5 0" dur="6.2s" repeatCount="indefinite" />
            <path
              id={waveSecondaryId}
              d={`M ${waterBounds.left - 2} ${waterTopY} C ${waterBounds.left + 18} ${waterTopY - 4} ${waterBounds.left + 36} ${waterTopY - 4} ${waterBounds.left + 56} ${waterTopY} C ${waterBounds.left + 78} ${waterTopY + 4} ${waterBounds.left + 96} ${waterTopY + 4} ${waterBounds.left + 116} ${waterTopY} C ${waterBounds.left + 132} ${waterTopY - 3} ${waterBounds.left + 146} ${waterTopY - 3} ${waterBounds.right + 2} ${waterTopY}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.78"
              strokeWidth="1.8"
            />
            <animateTransform href={`#${waveSecondaryId}`} attributeName="transform" type="translate" values="3 0; -4 0; 3 0" dur="4.8s" repeatCount="indefinite" />
            <path
              d={`M ${waterBounds.left + 8} ${waterTopY + 8} C ${waterBounds.left + 28} ${waterTopY + 4} ${waterBounds.left + 46} ${waterTopY + 6} ${waterBounds.left + 66} ${waterTopY + 9} C ${waterBounds.left + 82} ${waterTopY + 12} ${waterBounds.left + 98} ${waterTopY + 12} ${waterBounds.left + 114} ${waterTopY + 8}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.18"
              strokeWidth="1.4"
            >
              <animateTransform attributeName="transform" type="translate" values="-3 0; 4 0; -3 0" dur="7.4s" repeatCount="indefinite" />
            </path>
          </g>

          <line
            x1={basinXAtY(thresholdY).left}
            y1={thresholdY}
            x2={basinXAtY(thresholdY).right}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1.6"
            strokeDasharray="5 5"
            strokeOpacity="0.8"
          />

          {exceedsScale && (
            <>
              <g transform="translate(274 28)">
                <rect width="118" height="24" rx="12" fill={style.badge} />
                <path d="M14 15 L19 9 L24 15" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <text x="71" y="15.5" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#ffffff">
                  Overflowing
                </text>
              </g>
              <path d={`M ${waterBounds.left + 44} ${basinTopY - 8} L ${waterBounds.left + 49} ${basinTopY - 15} L ${waterBounds.left + 54} ${basinTopY - 8}`} fill="none" stroke={style.badge} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${waterBounds.left + 58} ${basinTopY - 8} L ${waterBounds.left + 63} ${basinTopY - 15} L ${waterBounds.left + 68} ${basinTopY - 8}`} fill="none" stroke={style.badge} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </>
      ) : (
        <>
          <text x="210" y="116" textAnchor="middle" fontSize="16" fontWeight="800" fill="#64748b">
            No live reading
          </text>
          <text x="210" y="136" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#94a3b8" letterSpacing="1">
            AWAITING TELEMETRY
          </text>
        </>
      )}
    </svg>
  );
}
