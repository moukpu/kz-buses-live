"use client";

import { motion } from "framer-motion";
import { markerReveal } from "@/styles/motion";
import type { RouteStatus } from "@/types/transit";

interface BusMarkerProps {
  shortName: string;
  /** HEX route color, без альфы. Падает из `Route.color`. */
  color: string;
  /** Компасный азимут 0..360. */
  bearing: number;
  status: RouteStatus;
  /** Подсветить выбранный маршрут — крупнее, glow. */
  active?: boolean;
}

/**
 * SVG-маркер автобуса для оверлея над MapLibre.
 * Размер фиксированный (40×40 для active, 32×32 иначе), позиционирование
 * происходит в `BusMap` через absolute + map.project().
 *
 * Цвета берутся из props (брэнд маршрута) и tokens (статус: live/delayed/offline).
 */
export function BusMarker({
  shortName,
  color,
  bearing,
  status,
  active = false,
}: BusMarkerProps): React.ReactElement {
  const size = active ? 44 : 32;
  const statusColor =
    status === "operating"
      ? "var(--live)"
      : status === "idle"
        ? "var(--delayed)"
        : "var(--offline)";
  const fade = status === "operating" ? 1 : 0.7;

  return (
    <motion.div
      variants={markerReveal}
      initial="hidden"
      animate="visible"
      style={{
        width: size,
        height: size,
        opacity: fade,
        filter: active ? `drop-shadow(0 0 14px ${color})` : undefined,
        pointerEvents: "auto",
      }}
      className="select-none"
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        aria-label={`bus ${shortName}`}
        role="img"
      >
        <defs>
          <radialGradient id={`bg-${shortName}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.75" />
          </radialGradient>
        </defs>

        {/* Compass arrow — указывает направление движения */}
        <g transform={`rotate(${bearing} 22 22)`}>
          <path d="M22 4 L28 14 L22 11 L16 14 Z" fill={statusColor} opacity="0.95" />
        </g>

        {/* Brand-coloured disc with route number */}
        <circle
          cx="22"
          cy="22"
          r={active ? 13 : 11}
          fill={`url(#bg-${shortName})`}
          stroke="var(--bg)"
          strokeWidth="2"
        />
        <text
          x="22"
          y="22"
          fill="#fff"
          fontFamily="var(--font-mono)"
          fontSize={active ? "12" : "10"}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {shortName}
        </text>
      </svg>
    </motion.div>
  );
}
