/**
 * Жёсткая модель данных для транзит-домена.
 * Источник правды для маршрутов, остановок и live-позиций.
 *
 * Owner: архитектура (Миша). Менять только через PR на feat/architecture.
 */

import type { locales } from "@/i18n/routing";

/** [lon, lat] в порядке GeoJSON. Не использовать {lng, lat} объект — он шире и хуже сериализуется в API. */
export type LngLat = readonly [number, number];

/** Прямоугольник [west, south, east, north]. */
export type BBox = readonly [number, number, number, number];

/** Локализованная строка. Ключи = поддерживаемые локали из i18n/routing.ts + en (для OG/мета). */
export type LocalizedString = {
  [K in (typeof locales)[number]]: string;
} & {
  en: string;
};

/** 12 городов в фазе 1. Расширяется через PR. */
export type CitySlug =
  | "almaty"
  | "astana"
  | "shymkent"
  | "karaganda"
  | "aktobe"
  | "taraz"
  | "pavlodar"
  | "oskemen"
  | "semey"
  | "atyrau"
  | "kostanay"
  | "kyzylorda";

/** Тип подвижного состава. */
export type RouteKind = "bus" | "trolleybus" | "minibus" | "tram";

/** Состояние маршрута в момент запроса фида. */
export type RouteStatus = "operating" | "idle" | "suspended";

/** Остановка маршрута, фиксированная (не зависит от направления в фазе 1). */
export interface Stop {
  /** Глобально уникальный id, формат `${routeId}-s-${order}`. */
  id: string;
  /** Позиция в маршруте, 1-based, монотонно возрастает. */
  order: number;
  name: LocalizedString;
  location: LngLat;
}

/** Один маршрут одного города. Направление одно (прямое); обратное добавим в фазе 3. */
export interface Route {
  /** Глобально уникальный id, формат `${citySlug}-${shortName}`. */
  id: string;
  citySlug: CitySlug;
  /** Краткий номер для UI, напр. "2", "32А". */
  shortName: string;
  longName: LocalizedString;
  kind: RouteKind;
  /** HEX без альфы, для отрисовки линии и иконки автобуса. */
  color: string;
  /** Средний интервал между автобусами в минутах. Питает симуляцию. */
  headwayMinutes: number;
  /** Часы работы в локальном времени города ("HH:mm"). */
  operatingHours: {
    from: string;
    to: string;
  };
  /** Остановки в порядке прохождения (минимум 4). */
  stops: readonly Stop[];
  /** Полилиния маршрута, [lon, lat] точки. Минимум 8 точек, плотность — раз в ~300–500 м. */
  geometry: readonly LngLat[];
}

/** Базовая запись города в transit-домене. Лёнин `src/lib/cities.ts` — отдельный landing-метафайл. */
export interface City {
  slug: CitySlug;
  name: LocalizedString;
  center: LngLat;
  bbox: BBox;
  /** IANA TZ, для часов работы маршрутов. Все казахстанские города сейчас UTC+5 → "Asia/Almaty". */
  timezone: string;
  population: number;
  routes: readonly Route[];
}

/** Live-позиция конкретного автобуса. Сериализуется в JSON один-в-один. */
export interface BusPosition {
  /** Стабильный id автобуса в рамках маршрута, `${routeId}-bus-${index}`. */
  busId: string;
  routeId: string;
  location: LngLat;
  /** 0..360, компасный азимут движения. Для иконки-стрелки. */
  bearing: number;
  speedKmh: number;
  /** Индекс точки `geometry`, до которой автобус доехал (отладочное). */
  segmentIndex: number;
  /** 0..1, доля сегмента от segmentIndex до segmentIndex+1. */
  progressOnSegment: number;
  /** Ближайшая будущая остановка; null если автобус закончил круг. */
  nextStopId: string | null;
  status: RouteStatus;
  /** ISO-8601 timestamp генерации позиции на сервере. */
  updatedAt: string;
}

/** Ответ `/api/feed/[citySlug]`. */
export interface CityFeed {
  citySlug: CitySlug;
  /** ISO-8601 generated-at. Совпадает с server `Date.now()` на момент ответа. */
  generatedAt: string;
  /** Источник данных: симуляция или upstream (GTFS-RT прокси). */
  source: "simulation" | "upstream";
  positions: readonly BusPosition[];
}

/** Стандартный shape ошибки от API feed. */
export interface FeedError {
  error: "city_not_found" | "rate_limited" | "upstream_failed" | "bad_request";
  message: string;
  /** Retry-After seconds для rate-limited. */
  retryAfterSec?: number;
}
