"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Status = "live" | "delayed" | "offline";

interface LiveDotProps {
  status?: Status;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZE_PX: Record<NonNullable<LiveDotProps["size"]>, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const STATUS_COLOR: Record<Status, string> = {
  live: "var(--live)",
  delayed: "var(--delayed)",
  offline: "var(--offline)",
};

const STATUS_SOFT: Record<Status, string> = {
  live: "var(--live-soft)",
  delayed: "var(--delayed-soft)",
  offline: "var(--offline-soft)",
};

/**
 * Пульсирующий маркер статуса. Анимация работает в reduced-motion как
 * простая точка (без бегущего ring'а).
 */
export function LiveDot({
  status = "live",
  size = "md",
  label,
  className,
}: LiveDotProps): React.ReactElement {
  const reduce = useReducedMotion();
  const px = SIZE_PX[size];
  const color = STATUS_COLOR[status];
  const soft = STATUS_SOFT[status];

  return (
    <span className={cn("inline-flex items-center gap-2 align-middle", className)}>
      <span className="relative inline-flex" style={{ width: px, height: px }} aria-hidden={!label}>
        {!reduce && status !== "offline" && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: soft }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
          />
        )}
        <span
          className="relative inline-block rounded-full"
          style={{ width: px, height: px, background: color, boxShadow: `0 0 0 2px ${soft}` }}
        />
      </span>
      {label ? (
        <span className="text-text-muted font-mono text-[10px] tracking-wider uppercase">
          {label}
        </span>
      ) : null}
    </span>
  );
}
