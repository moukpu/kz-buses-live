"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cities } from "@/lib/cities";

/**
 * SVG-силуэт Казахстана + пульсирующие точки 12 городов.
 *
 * Силуэт — упрощённый polygon на ~30 точках; не претендует на точную
 * картографию (для hero-декорации достаточно). Координаты городов
 * проецируются в viewBox через linear-map от bbox страны.
 */

const KZ_BBOX = {
  west: 46.5,
  east: 87.5,
  south: 40.5,
  north: 55.5,
};

const VB_W = 1200;
const VB_H = 540;
const PAD_X = 40;
const PAD_Y = 30;

function project(lng: number, lat: number): { x: number; y: number } {
  const { west, east, south, north } = KZ_BBOX;
  const tx = (lng - west) / (east - west);
  const ty = (north - lat) / (north - south);
  const x = PAD_X + tx * (VB_W - PAD_X * 2);
  const y = PAD_Y + ty * (VB_H - PAD_Y * 2);
  return { x, y };
}

const KZ_OUTLINE_POINTS: ReadonlyArray<readonly [number, number]> = [
  [47.0, 50.3],
  [47.5, 49.2],
  [49.0, 48.0],
  [50.7, 46.7],
  [52.5, 45.5],
  [54.5, 45.0],
  [56.0, 45.5],
  [58.0, 45.5],
  [60.0, 44.5],
  [62.0, 43.5],
  [64.5, 43.0],
  [67.5, 42.0],
  [70.5, 42.0],
  [73.0, 42.5],
  [75.5, 42.8],
  [77.5, 42.6],
  [79.5, 42.8],
  [80.5, 43.5],
  [82.5, 45.0],
  [83.0, 47.0],
  [85.0, 48.5],
  [87.0, 49.0],
  [86.0, 50.5],
  [84.5, 51.0],
  [82.0, 51.5],
  [80.0, 51.0],
  [77.0, 53.5],
  [73.5, 54.0],
  [71.0, 54.5],
  [68.0, 55.0],
  [65.0, 54.5],
  [62.5, 54.0],
  [60.0, 53.5],
  [56.5, 51.0],
  [54.0, 51.5],
  [51.5, 51.5],
  [49.5, 51.0],
  [47.5, 50.7],
];

const KZ_PATH_D: string =
  KZ_OUTLINE_POINTS.map(([lng, lat], i) => {
    const { x, y } = project(lng, lat);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

export function KazakhstanSilhouette({ className }: { className?: string }): React.ReactElement {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="kz-silhouette-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
        <filter id="kz-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <path
        d={KZ_PATH_D}
        fill="url(#kz-silhouette-grad)"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />

      {cities.map((c, idx) => {
        const { x, y } = project(c.center.lng, c.center.lat);
        const delay = idx * 0.12;
        return (
          <g key={c.slug}>
            {!reduce && (
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                fill="var(--accent)"
                opacity={0.35}
                animate={{ r: [6, 18, 6], opacity: [0.45, 0, 0.45] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay,
                  ease: "easeOut",
                }}
                filter="url(#kz-glow)"
              />
            )}
            <motion.circle
              cx={x}
              cy={y}
              r="4.2"
              fill="var(--accent)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.03, duration: 0.4 }}
            />
            <text
              x={x + 9}
              y={y + 4}
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--text-muted)"
              className="hidden sm:inline"
            >
              {c.nameRu}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
