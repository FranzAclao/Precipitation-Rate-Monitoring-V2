import React, { useId } from "react";

const STATUS_STYLES = {
  safe: {
    water: "#38bdf8",
    waterDeep: "#0ea5e9",
    waterMid: "#0284c7",
    waterSoft: "#dbeafe",
    line: "#0284c7",
    badge: "#0369a1",
    shimmer: "#7dd3fc",
    depthDark: "#0c4a6e",
    specular: "#e0f2fe",
  },
  watch: {
    water: "#38bdf8",
    waterDeep: "#0ea5e9",
    waterMid: "#0284c7",
    waterSoft: "#dbeafe",
    line: "#ca8a04",
    badge: "#a16207",
    shimmer: "#7dd3fc",
    depthDark: "#0c4a6e",
    specular: "#e0f2fe",
  },
  caution: {
    water: "#38bdf8",
    waterDeep: "#0ea5e9",
    waterMid: "#0284c7",
    waterSoft: "#dbeafe",
    line: "#ea580c",
    badge: "#c2410c",
    shimmer: "#7dd3fc",
    depthDark: "#0c4a6e",
    specular: "#e0f2fe",
  },
  "flood-risk": {
    water: "#38bdf8",
    waterDeep: "#0ea5e9",
    waterMid: "#0284c7",
    waterSoft: "#dbeafe",
    line: "#dc2626",
    badge: "#991b1b",
    shimmer: "#7dd3fc",
    depthDark: "#0c4a6e",
    specular: "#e0f2fe",
  },
  "no-data": {
    water: "#cbd5e1",
    waterDeep: "#94a3b8",
    waterMid: "#64748b",
    waterSoft: "#e2e8f0",
    line: "#64748b",
    badge: "#475569",
    shimmer: "#e2e8f0",
    depthDark: "#1e293b",
    specular: "#f1f5f9",
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

function getScaleTicks(limit) {
  const max = toNumber(limit) || 55;
  const ticks = [];
  for (let value = 0; value <= max; value += 5) {
    ticks.push({ value, ratio: max > 0 ? value / max : 0 });
  }
  if (ticks[ticks.length - 1]?.value !== max) {
    ticks.push({ value: max, ratio: 1 });
  }
  return ticks;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function CanalSvg({ level, maxLevel, status, hasData, thresholdLevel = 47 }) {
  const ids = useId().replace(/:/g, "");
  const clipId = `canal-water-${ids}`;
  const depthGradId = `depth-grad-${ids}`;
  const wallLeftGradId = `wall-left-grad-${ids}`;
  const wallRightGradId = `wall-right-grad-${ids}`;
  const wallFloorGradId = `wall-floor-grad-${ids}`;
  const specularGradId = `specular-grad-${ids}`;
  const aoLeftId = `ao-left-${ids}`;
  const aoRightId = `ao-right-${ids}`;
  const foamGradId = `foam-grad-${ids}`;
  const surfaceReflectId = `surface-reflect-${ids}`;
  const rimHighlightId = `rim-highlight-${ids}`;

  const normalizedStatus = hasData ? status : "no-data";
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES["no-data"];
  const limit = toNumber(maxLevel) || 55;
  const current = toNumber(level);
  const exceedsScale = hasData && current !== null && current > limit;
  const fillRatio = getFillRatio(level, maxLevel, hasData);

  // Geometry
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
  const wL = waterBounds.left;
  const wR = waterBounds.right;
  const wT = waterTopY;
  const bB = basinBottomY;

  // Wave paths
  const waveDeep = (offset = 0) =>
    `M ${wL - 10} ${wT + 8 + offset} C ${wL + 20} ${wT + 14} ${wL + 50} ${wT + 2} ${wL + 80} ${wT + 9} C ${wL + 110} ${wT + 16} ${wL + 130} ${wT + 4} ${wR + 10} ${wT + 9 + offset} L ${wR + 12} ${bB + 4} L ${wL - 12} ${bB + 4} Z`;
  const waveMid = () =>
    `M ${wL - 10} ${wT + 4} C ${wL + 18} ${wT - 2} ${wL + 40} ${wT + 10} ${wL + 64} ${wT + 4} C ${wL + 88} ${wT - 2} ${wL + 110} ${wT + 8} ${wL + 132} ${wT + 3} C ${wL + 146} ${wT - 1} ${wR - 4} ${wT + 2} ${wR + 10} ${wT + 4} L ${wR + 12} ${bB + 4} L ${wL - 12} ${bB + 4} Z`;
  const waveTop = () =>
    `M ${wL - 10} ${wT + 2} C ${wL + 10} ${wT - 5} ${wL + 30} ${wT - 5} ${wL + 50} ${wT + 2} C ${wL + 72} ${wT + 9} ${wL + 94} ${wT + 9} ${wL + 116} ${wT + 2} C ${wL + 132} ${wT - 3} ${wL + 146} ${wT - 3} ${wR + 10} ${wT + 2} L ${wR + 12} ${bB + 4} L ${wL - 12} ${bB + 4} Z`;
  const surfaceLine = (yOff = 0) =>
    `M ${wL - 2} ${wT + yOff} C ${wL + 18} ${wT - 4 + yOff} ${wL + 36} ${wT - 4 + yOff} ${wL + 56} ${wT + yOff} C ${wL + 78} ${wT + 4 + yOff} ${wL + 96} ${wT + 4 + yOff} ${wL + 116} ${wT + yOff} C ${wL + 132} ${wT - 3 + yOff} ${wL + 146} ${wT - 3 + yOff} ${wR + 2} ${wT + yOff}`;

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 420 220"
      preserveAspectRatio="none"
      role="img"
      aria-label="Canal water level cross-section"
    >
      <defs>
        {/* Water depth gradient: dark navy bottom → bright blue top */}
        <linearGradient id={depthGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={style.depthDark} stopOpacity="1" />
          <stop offset="35%" stopColor={style.waterMid} stopOpacity="0.95" />
          <stop offset="70%" stopColor={style.waterDeep} stopOpacity="0.88" />
          <stop offset="100%" stopColor={style.water} stopOpacity="0.75" />
        </linearGradient>

        {/* Specular highlight gradient: bright center → transparent edges */}
        <linearGradient id={specularGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={style.specular} stopOpacity="0" />
          <stop offset="30%" stopColor={style.specular} stopOpacity="0.55" />
          <stop offset="50%" stopColor={style.specular} stopOpacity="0.85" />
          <stop offset="70%" stopColor={style.specular} stopOpacity="0.55" />
          <stop offset="100%" stopColor={style.specular} stopOpacity="0" />
        </linearGradient>

        {/* Foam/surface reflection gradient */}
        <linearGradient id={foamGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Left wall gradient: light on top-left (light source), dark on inner edge */}
        <linearGradient id={wallLeftGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f8fafc" stopOpacity="1" />
          <stop offset="40%" stopColor="#cbd5e1" stopOpacity="1" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="1" />
        </linearGradient>

        {/* Right wall gradient: shadow on far right, lighter on inner edge */}
        <linearGradient id={wallRightGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b0bec5" stopOpacity="1" />
          <stop offset="60%" stopColor="#90a4ae" stopOpacity="1" />
          <stop offset="100%" stopColor="#607d8b" stopOpacity="1" />
        </linearGradient>

        {/* Floor gradient: darker at center for depth illusion */}
        <linearGradient id={wallFloorGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Ambient occlusion shadows where water meets walls */}
        <linearGradient id={aoLeftId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={aoRightId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>

        {/* Surface rim highlight gradient */}
        <linearGradient id={rimHighlightId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Clip path for water body */}
        <clipPath id={clipId}>
          <path d={`M ${basinTopLeftX} ${basinTopY} L ${basinTopRightX} ${basinTopY} L ${basinBottomRightX} ${basinBottomY + 4} L ${basinBottomLeftX} ${basinBottomY + 4} Z`} />
        </clipPath>
      </defs>

      {/* Background card */}
      <rect x="16" y="14" width="388" height="192" rx="18" fill="rgba(255,255,255,0.42)" stroke="#dbe4ef" />

      {/* Scale ticks */}
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

      {/* ── CANAL WALLS ── */}
      <g>
        {/* Left wall: gradient with 3D shading — light hits top-left */}
        <path
          d={`M ${wallOuterTopLeftX} 54 L ${basinTopLeftX} ${basinTopY} L ${basinBottomLeftX} ${basinBottomY} L ${wallOuterBottomLeftX} ${wallBottomY} Z`}
          fill={`url(#${wallLeftGradId})`}
        />

        {/* Right wall: gradient darker on far right (shadow side) */}
        <path
          d={`M ${basinTopRightX} ${basinTopY} L ${wallOuterTopRightX} 54 L ${wallOuterBottomRightX} ${wallBottomY} L ${basinBottomRightX} ${basinBottomY} Z`}
          fill={`url(#${wallRightGradId})`}
        />

        {/* Floor: gradient darker at center for concave depth illusion */}
        <path
          d={`M ${wallOuterBottomLeftX} ${wallBottomY} L ${wallOuterBottomRightX} ${wallBottomY} L ${basinBottomRightX} ${basinBottomY} L ${basinBottomLeftX} ${basinBottomY} Z`}
          fill={`url(#${wallFloorGradId})`}
        />

        {/* Left wall top cap highlight (catches light from above) */}
        <path
          d={`M ${wallOuterTopLeftX} 54 L ${basinTopLeftX} ${basinTopY} L ${basinTopLeftX + 8} ${basinTopY} L ${wallOuterTopLeftX + 8} 54 Z`}
          fill="#ffffff"
          fillOpacity="0.55"
        />

        {/* Right wall top cap highlight */}
        <path
          d={`M ${basinTopRightX - 8} ${basinTopY} L ${wallOuterTopRightX - 8} 54 L ${wallOuterTopRightX} 54 L ${basinTopRightX} ${basinTopY} Z`}
          fill="#ffffff"
          fillOpacity="0.3"
        />

        {/* Inner wall edge lines (structural seam) */}
        <path d={`M ${basinTopLeftX} ${basinTopY} L ${basinBottomLeftX} ${basinBottomY}`} fill="none" stroke="#334155" strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M ${basinTopRightX} ${basinTopY} L ${basinBottomRightX} ${basinBottomY}`} fill="none" stroke="#1e293b" strokeWidth="3.6" strokeLinecap="round" />
        <path d={`M ${basinBottomLeftX} ${basinBottomY} L ${basinBottomRightX} ${basinBottomY}`} fill="none" stroke="#0f172a" strokeWidth="4.8" strokeLinecap="round" />

        {/* Outer rim lines */}
        <path d={`M ${wallOuterTopLeftX} 54 L ${basinTopLeftX} ${basinTopY}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <path d={`M ${basinTopRightX} ${basinTopY} L ${wallOuterTopRightX} 54`} fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

        {/* Left wall inner edge: soft highlight streak for 3D bevel */}
        <line
          x1={basinTopLeftX + 3}
          y1={basinTopY}
          x2={basinBottomLeftX + 2}
          y2={basinBottomY}
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right wall inner edge: shadow streak */}
        <line
          x1={basinTopRightX - 3}
          y1={basinTopY}
          x2={basinBottomRightX - 2}
          y2={basinBottomY}
          stroke="#000000"
          strokeOpacity="0.15"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {hasData ? (
        <>
          <g clipPath={`url(#${clipId})`}>
            {/* ── WATER BODY: depth gradient (dark bottom → bright top) ── */}
            <rect
              x={wL - 12}
              y={wT}
              width={(wR - wL) + 24}
              height={bB - wT + 6}
              fill={`url(#${depthGradId})`}
            />

            {/* ── Ambient occlusion: where water contacts left wall ── */}
            <rect
              x={wL - 12}
              y={wT}
              width={28}
              height={bB - wT + 6}
              fill={`url(#${aoLeftId})`}
            />

            {/* ── Ambient occlusion: where water contacts right wall ── */}
            <rect
              x={wR - 16}
              y={wT}
              width={28}
              height={bB - wT + 6}
              fill={`url(#${aoRightId})`}
            />

            {/* ── Dark contact shadow at floor ── */}
            <rect
              x={wL - 12}
              y={bB - 10}
              width={(wR - wL) + 24}
              height={16}
              fill="#000000"
              fillOpacity="0.18"
            />

            {/* ── Caustic floor patches ── */}
            <ellipse cx={wL + 30} cy={bB - 8} rx="14" ry="4" fill={style.shimmer} fillOpacity="0.28">
              <animate attributeName="cx" values={`${wL+30};${wL+38};${wL+24};${wL+30}`} dur="6.1s" repeatCount="indefinite" />
              <animate attributeName="rx" values="14;18;11;14" dur="6.1s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.28;0.16;0.34;0.28" dur="6.1s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx={wL + 68} cy={bB - 12} rx="10" ry="3" fill={style.shimmer} fillOpacity="0.22">
              <animate attributeName="cx" values={`${wL+68};${wL+58};${wL+76};${wL+68}`} dur="7.3s" repeatCount="indefinite" />
              <animate attributeName="rx" values="10;14;8;10" dur="7.3s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.22;0.32;0.14;0.22" dur="7.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx={wL + 48} cy={bB - 4} rx="7" ry="2.5" fill={style.shimmer} fillOpacity="0.18">
              <animate attributeName="cx" values={`${wL+48};${wL+56};${wL+40};${wL+48}`} dur="5s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.18;0.28;0.1;0.18" dur="5s" repeatCount="indefinite" />
            </ellipse>

            {/* ── Subsurface shimmer streaks ── */}
            <line x1={wL + 14} y1={wT + 18} x2={wL + 28} y2={wT + 42} stroke={style.shimmer} strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="stroke-opacity" values="0.18;0.06;0.24;0.18" dur="3.8s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0 0;8 0;0 0" dur="3.8s" repeatCount="indefinite" />
            </line>
            <line x1={wL + 80} y1={wT + 12} x2={wL + 95} y2={wT + 38} stroke={style.shimmer} strokeOpacity="0.14" strokeWidth="1.5" strokeLinecap="round">
              <animate attributeName="stroke-opacity" values="0.14;0.24;0.07;0.14" dur="4.9s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0 0;-6 0;0 0" dur="4.9s" repeatCount="indefinite" />
            </line>

            {/* ── Bubble particles ── */}
            <circle cx={wL + 24} cy={bB} r="1.5" fill="#ffffff" fillOpacity="0">
              <animate attributeName="cy" values={`${bB};${wT + 8}`} dur="4s" repeatCount="indefinite" begin="0s" />
              <animate attributeName="fill-opacity" values="0;0.4;0.25;0" dur="4s" repeatCount="indefinite" begin="0s" />
              <animate attributeName="r" values="1.5;2;1.2;0.4" dur="4s" repeatCount="indefinite" begin="0s" />
            </circle>
            <circle cx={wL + 62} cy={bB} r="1.2" fill="#ffffff" fillOpacity="0">
              <animate attributeName="cy" values={`${bB};${wT + 12}`} dur="5.2s" repeatCount="indefinite" begin="1.4s" />
              <animate attributeName="fill-opacity" values="0;0.35;0.18;0" dur="5.2s" repeatCount="indefinite" begin="1.4s" />
              <animate attributeName="r" values="1.2;1.8;1;0.3" dur="5.2s" repeatCount="indefinite" begin="1.4s" />
            </circle>
            <circle cx={wL + 42} cy={bB} r="1" fill="#ffffff" fillOpacity="0">
              <animate attributeName="cy" values={`${bB};${wT + 16}`} dur="3.6s" repeatCount="indefinite" begin="2.8s" />
              <animate attributeName="fill-opacity" values="0;0.3;0.15;0" dur="3.6s" repeatCount="indefinite" begin="2.8s" />
            </circle>
            <circle cx={wL + 86} cy={bB} r="1.4" fill="#ffffff" fillOpacity="0">
              <animate attributeName="cy" values={`${bB};${wT + 10}`} dur="4.8s" repeatCount="indefinite" begin="0.7s" />
              <animate attributeName="fill-opacity" values="0;0.28;0.12;0" dur="4.8s" repeatCount="indefinite" begin="0.7s" />
            </circle>

            {/* ── Wave layer: deep / back ── */}
            <path d={waveDeep(0)} fill={style.water} fillOpacity="0.18">
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values={`${waveDeep(0)};${waveDeep(-3)};${waveDeep(2)};${waveDeep(0)}`}
              />
            </path>

            {/* ── Wave layer: mid ── */}
            <path d={waveMid()} fill={style.water} fillOpacity="0.25">
              <animate
                attributeName="d"
                dur="5.4s"
                repeatCount="indefinite"
                values={`
                  M ${wL-10} ${wT+4} C ${wL+18} ${wT-2} ${wL+40} ${wT+10} ${wL+64} ${wT+4} C ${wL+88} ${wT-2} ${wL+110} ${wT+8} ${wL+132} ${wT+3} C ${wL+146} ${wT-1} ${wR-4} ${wT+2} ${wR+10} ${wT+4} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+6} C ${wL+20} ${wT+2} ${wL+42} ${wT-4} ${wL+66} ${wT+2} C ${wL+90} ${wT+8} ${wL+112} ${wT+2} ${wL+134} ${wT+6} C ${wL+148} ${wT+2} ${wR-4} ${wT+4} ${wR+10} ${wT+6} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+3} C ${wL+16} ${wT-5} ${wL+38} ${wT+6} ${wL+62} ${wT+1} C ${wL+86} ${wT-4} ${wL+108} ${wT+6} ${wL+130} ${wT+2} C ${wL+144} ${wT-2} ${wR-4} ${wT+1} ${wR+10} ${wT+3} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+4} C ${wL+18} ${wT-2} ${wL+40} ${wT+10} ${wL+64} ${wT+4} C ${wL+88} ${wT-2} ${wL+110} ${wT+8} ${wL+132} ${wT+3} C ${wL+146} ${wT-1} ${wR-4} ${wT+2} ${wR+10} ${wT+4} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z
                `}
              />
            </path>

            {/* ── Wave layer: top surface ── */}
            <path d={waveTop()} fill="#ffffff" fillOpacity="0.08">
              <animate
                attributeName="d"
                dur="4.2s"
                repeatCount="indefinite"
                values={`
                  M ${wL-10} ${wT+2} C ${wL+10} ${wT-5} ${wL+30} ${wT-5} ${wL+50} ${wT+2} C ${wL+72} ${wT+9} ${wL+94} ${wT+9} ${wL+116} ${wT+2} C ${wL+132} ${wT-3} ${wL+146} ${wT-3} ${wR+10} ${wT+2} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+3} C ${wL+12} ${wT-2} ${wL+34} ${wT-8} ${wL+56} ${wT-1} C ${wL+78} ${wT+6} ${wL+98} ${wT+10} ${wL+120} ${wT+3} C ${wL+136} ${wT-4} ${wL+150} ${wT-6} ${wR+10} ${wT+1} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+2} C ${wL+8} ${wT-7} ${wL+28} ${wT-2} ${wL+48} ${wT+3} C ${wL+70} ${wT+8} ${wL+92} ${wT+5} ${wL+114} ${wT+1} C ${wL+130} ${wT-5} ${wL+146} ${wT-1} ${wR+10} ${wT+2} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z;
                  M ${wL-10} ${wT+2} C ${wL+10} ${wT-5} ${wL+30} ${wT-5} ${wL+50} ${wT+2} C ${wL+72} ${wT+9} ${wL+94} ${wT+9} ${wL+116} ${wT+2} C ${wL+132} ${wT-3} ${wL+146} ${wT-3} ${wR+10} ${wT+2} L ${wR+12} ${bB+4} L ${wL-12} ${bB+4} Z
                `}
              />
            </path>

            {/* ── Foam/near-surface reflection layer ── */}
            <rect
              x={wL - 12}
              y={wT}
              width={(wR - wL) + 24}
              height={18}
              fill={`url(#${foamGradId})`}
            />

            {/* ── Specular highlight: bright elliptical glint at surface ── */}
            <ellipse
              cx={(wL + wR) / 2}
              cy={wT + 3}
              rx={(wR - wL) * 0.35}
              ry="5"
              fill={`url(#${specularGradId})`}
            >
              <animate attributeName="rx" values={`${(wR-wL)*0.35};${(wR-wL)*0.42};${(wR-wL)*0.28};${(wR-wL)*0.35}`} dur="4.2s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${wT+3};${wT+5};${wT+1};${wT+3}`} dur="4.2s" repeatCount="indefinite" />
            </ellipse>

            {/* ── Surface line ── */}
            <path d={surfaceLine(0)} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="2">
              <animate
                attributeName="d"
                dur="4.2s"
                repeatCount="indefinite"
                values={`
                  ${surfaceLine(0)};
                  M ${wL-2} ${wT+1} C ${wL+14} ${wT-5} ${wL+34} ${wT-1} ${wL+54} ${wT+2} C ${wL+74} ${wT+5} ${wL+94} ${wT+1} ${wL+114} ${wT-1} C ${wL+130} ${wT-4} ${wL+146} ${wT-5} ${wR+2} ${wT+1};
                  M ${wL-2} ${wT} C ${wL+20} ${wT-2} ${wL+38} ${wT-6} ${wL+58} ${wT-1} C ${wL+80} ${wT+4} ${wL+98} ${wT+6} ${wL+118} ${wT+1} C ${wL+134} ${wT-2} ${wL+148} ${wT-4} ${wR+2} ${wT};
                  ${surfaceLine(0)}
                `}
              />
            </path>

            {/* ── Surface sparkle dots ── */}
            <circle cx={wL + 18} cy={wT} r="1.8" fill="#ffffff" fillOpacity="0.7">
              <animate attributeName="fill-opacity" values="0.7;0.1;0.85;0.2;0.7" dur="3.1s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.8;1.2;2.2;1;1.8" dur="3.1s" repeatCount="indefinite" />
            </circle>
            <circle cx={wL + 60} cy={wT + 1} r="1.4" fill="#ffffff" fillOpacity="0.5">
              <animate attributeName="fill-opacity" values="0.5;0.9;0.2;0.7;0.5" dur="4.4s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.4;2;0.8;1.6;1.4" dur="4.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={wL + 95} cy={wT - 1} r="1" fill="#ffffff" fillOpacity="0.6">
              <animate attributeName="fill-opacity" values="0.6;0.1;0.75;0.3;0.6" dur="2.7s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* ── Rim highlight: where water surface meets wall ── */}
          {/* Left rim glow */}
          <rect
            x={wL - 4}
            y={wT - 2}
            width={8}
            height={6}
            fill="#ffffff"
            fillOpacity="0.6"
            rx="2"
          />
          {/* Right rim glow */}
          <rect
            x={wR - 4}
            y={wT - 2}
            width={8}
            height={6}
            fill="#ffffff"
            fillOpacity="0.45"
            rx="2"
          />

          {/* ── Threshold line ── */}
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
              <path d={`M ${wL + 44} ${basinTopY - 8} L ${wL + 49} ${basinTopY - 15} L ${wL + 54} ${basinTopY - 8}`} fill="none" stroke={style.badge} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${wL + 58} ${basinTopY - 8} L ${wL + 63} ${basinTopY - 15} L ${wL + 68} ${basinTopY - 8}`} fill="none" stroke={style.badge} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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