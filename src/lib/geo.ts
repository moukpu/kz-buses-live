/**
 * Геометрия на сфере. Edge-runtime safe (только Math).
 *
 * Используется симуляцией позиций и при построении геометрии маршрутов.
 */

import type { LngLat } from "@/types/transit";

const EARTH_RADIUS_M = 6_371_008.8;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Haversine: расстояние между двумя точками в метрах.
 * Точность достаточная для городских маршрутов (<50 км).
 */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Компасный азимут (0..360) из точки a в точку b. 0° = север, 90° = восток.
 */
export function bearingDeg(a: LngLat, b: LngLat): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Линейная интерполяция между двумя [lon, lat] точками.
 * Для коротких сегментов городского маршрута sphere-distortion пренебрежим.
 */
export function interpolate(a: LngLat, b: LngLat, t: number): LngLat {
  const clamped = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * clamped, a[1] + (b[1] - a[1]) * clamped];
}

/**
 * Кумулятивные длины полилинии: cumulative[i] = сумма длин сегментов до точки i.
 * cumulative[0] = 0, cumulative[N-1] = полная длина.
 */
export function cumulativeLengths(geometry: readonly LngLat[]): readonly number[] {
  if (geometry.length === 0) return [];
  const out: number[] = [0];
  for (let i = 1; i < geometry.length; i++) {
    const prev = geometry[i - 1];
    const curr = geometry[i];
    // noUncheckedIndexedAccess: явно проверяем, хотя в [1..length-1] всегда defined.
    if (!prev || !curr) {
      out.push(out[out.length - 1] ?? 0);
      continue;
    }
    const prevTotal = out[out.length - 1] ?? 0;
    out.push(prevTotal + distanceMeters(prev, curr));
  }
  return out;
}

/** Полная длина полилинии в метрах. */
export function totalLength(geometry: readonly LngLat[]): number {
  const c = cumulativeLengths(geometry);
  return c[c.length - 1] ?? 0;
}

export interface PointOnPath {
  location: LngLat;
  bearing: number;
  segmentIndex: number;
  progressOnSegment: number;
}

/**
 * Найти точку на полилинии по доле `progress` в [0..1] от полной длины.
 * Возвращает координату, азимут (по направлению сегмента) и индекс сегмента.
 */
export function pointAlongPath(
  geometry: readonly LngLat[],
  cumulative: readonly number[],
  progress: number,
): PointOnPath | null {
  if (geometry.length < 2 || cumulative.length !== geometry.length) return null;
  const total = cumulative[cumulative.length - 1] ?? 0;
  if (total === 0) return null;

  const target = Math.max(0, Math.min(1, progress)) * total;

  // Линейный скан — для городских маршрутов 30–80 точек это дёшево.
  for (let i = 1; i < cumulative.length; i++) {
    const segEnd = cumulative[i];
    const segStart = cumulative[i - 1];
    if (segEnd === undefined || segStart === undefined) continue;
    if (target <= segEnd) {
      const segLen = segEnd - segStart;
      const t = segLen > 0 ? (target - segStart) / segLen : 0;
      const a = geometry[i - 1];
      const b = geometry[i];
      if (!a || !b) return null;
      return {
        location: interpolate(a, b, t),
        bearing: bearingDeg(a, b),
        segmentIndex: i - 1,
        progressOnSegment: t,
      };
    }
  }

  const last = geometry[geometry.length - 1];
  const prevToLast = geometry[geometry.length - 2];
  if (!last || !prevToLast) return null;
  return {
    location: last,
    bearing: bearingDeg(prevToLast, last),
    segmentIndex: geometry.length - 2,
    progressOnSegment: 1,
  };
}
