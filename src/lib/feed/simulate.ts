/**
 * Детерминированная симуляция позиций автобусов на маршрутах.
 *
 * Чистая функция от (city, nowMs). Никакого state, никакого random между
 * вызовами — клиент-polling каждые 5 сек получает стабильную картину,
 * без скачков «вперёд-назад».
 *
 * Edge-runtime safe.
 */

import type { BusPosition, City, CityFeed, Route, RouteStatus } from "@/types/transit";
import { cumulativeLengths, pointAlongPath } from "@/lib/geo";

const MIN_PER_MS = 1 / 60_000;

/**
 * Сколько минут занимает полный круг маршрута. Эмпирическая оценка:
 * ~25 км/ч средняя скорость городского автобуса с остановками
 * → 1 км ≈ 2.4 мин. Минимум 15 мин для коротких маршрутов.
 */
function routeLoopMinutes(route: Route, totalMeters: number): number {
  const fromMeters = (totalMeters / 1000) * 2.4;
  return Math.max(15, Math.round(fromMeters));
}

/**
 * Активен ли маршрут в данный момент с учётом operatingHours и tz.
 * tz передаётся как IANA-zone (например "Asia/Almaty"). Используем
 * Intl.DateTimeFormat для извлечения локальных HH:mm — это работает на edge.
 */
function isOperating(route: Route, now: Date, timezone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const localHHMM = fmt.format(now); // "HH:MM"
  const { from, to } = route.operatingHours;
  if (from <= to) {
    return localHHMM >= from && localHHMM <= to;
  }
  // Через полночь, напр. 22:00 → 02:00.
  return localHHMM >= from || localHHMM <= to;
}

/**
 * Симулировать одну сторону маршрута:
 *  - количество автобусов = ceil(loopMinutes / headwayMinutes)
 *  - каждый автобус смещён по фазе ровно на (1/N), едет с постоянной фазовой скоростью
 *  - позиция по фазе вычисляется через `pointAlongPath`
 */
function simulateRoute(route: Route, nowMs: number, timezone: string): BusPosition[] {
  if (route.geometry.length < 2) return [];

  const cumulative = cumulativeLengths(route.geometry);
  const totalMeters = cumulative[cumulative.length - 1] ?? 0;
  if (totalMeters === 0) return [];

  const loopMinutes = routeLoopMinutes(route, totalMeters);
  const loopMs = loopMinutes * 60_000;
  const headway = Math.max(1, route.headwayMinutes);
  const busCount = Math.max(1, Math.ceil(loopMinutes / headway));

  const now = new Date(nowMs);
  const operating = isOperating(route, now, timezone);
  const status: RouteStatus = operating ? "operating" : "idle";
  if (!operating) return [];

  const positions: BusPosition[] = [];
  const phaseBase = (nowMs % loopMs) / loopMs;
  const avgSpeedKmh = totalMeters / 1000 / (loopMinutes / 60);

  for (let i = 0; i < busCount; i++) {
    const phase = (phaseBase + i / busCount) % 1;
    const onPath = pointAlongPath(route.geometry, cumulative, phase);
    if (!onPath) continue;

    const nextStop = route.stops.find((s) => s.order > onPath.segmentIndex);

    positions.push({
      busId: `${route.id}-bus-${i + 1}`,
      routeId: route.id,
      location: onPath.location,
      bearing: Math.round(onPath.bearing * 10) / 10,
      speedKmh: Math.round(avgSpeedKmh * 10) / 10,
      segmentIndex: onPath.segmentIndex,
      progressOnSegment: Math.round(onPath.progressOnSegment * 1000) / 1000,
      nextStopId: nextStop?.id ?? null,
      status,
      updatedAt: now.toISOString(),
    });
  }

  return positions;
}

export interface SimulateOptions {
  /** Unix ms; default Date.now(). */
  nowMs?: number;
}

/**
 * Полный фид для города.
 */
export function simulateCity(city: City, opts: SimulateOptions = {}): CityFeed {
  const nowMs = opts.nowMs ?? Date.now();
  const positions = city.routes.flatMap((r) => simulateRoute(r, nowMs, city.timezone));
  return {
    citySlug: city.slug,
    generatedAt: new Date(nowMs).toISOString(),
    source: "simulation",
    positions,
  };
}

// Чтобы тесты могли явно убедиться в стабильности.
export const __testing = {
  MIN_PER_MS,
  routeLoopMinutes,
  isOperating,
};
