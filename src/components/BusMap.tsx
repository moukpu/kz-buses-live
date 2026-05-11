"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyle, hasMaptilerKey } from "@/lib/maptiler";
import type { BusPosition, City, LngLat, Route, RouteStatus } from "@/types/transit";

interface BusMapProps {
  city: City;
  positions: readonly BusPosition[];
  /** Подсветить полилинию выбранного маршрута и его автобусы. */
  highlightedRoute?: Route | null;
  onSelectBus?: (busId: string) => void;
  /** Отрисовать остановки маршрута (только при highlightedRoute). */
  showStops?: boolean;
}

const ROUTE_LINE_SOURCE = "kz-route-line";
const ROUTE_LINE_LAYER = "kz-route-line-layer";
const ROUTE_LINE_GLOW = "kz-route-line-glow";
const STOP_SOURCE = "kz-stops";
const STOP_LAYER = "kz-stops-layer";

interface MarkerEntry {
  marker: MlMarker;
  el: HTMLDivElement;
}

function makeMarkerEl(
  shortName: string,
  color: string,
  bearing: number,
  status: RouteStatus,
  active: boolean,
): HTMLDivElement {
  const size = active ? 44 : 32;
  const statusColor =
    status === "operating"
      ? "var(--live)"
      : status === "idle"
        ? "var(--delayed)"
        : "var(--offline)";

  const wrapper = document.createElement("div");
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.cursor = "pointer";
  wrapper.style.opacity = status === "operating" ? "1" : "0.7";
  if (active) wrapper.style.filter = `drop-shadow(0 0 14px ${color})`;
  wrapper.setAttribute("aria-label", `bus ${shortName}`);

  wrapper.innerHTML = `
    <svg viewBox="0 0 44 44" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${bearing} 22 22)">
        <path d="M22 4 L28 14 L22 11 L16 14 Z" fill="${statusColor}" opacity="0.95" />
      </g>
      <circle cx="22" cy="22" r="${active ? 13 : 11}" fill="${color}" stroke="var(--bg)" stroke-width="2" />
      <text x="22" y="22" fill="#fff" font-family="var(--font-mono, monospace)" font-size="${
        active ? 12 : 10
      }" font-weight="700" text-anchor="middle" dominant-baseline="central">${shortName}</text>
    </svg>
  `;
  return wrapper;
}

export default function BusMap({
  city,
  positions,
  highlightedRoute = null,
  onSelectBus,
  showStops = false,
}: BusMapProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const routesById = useMemo(() => new Map(city.routes.map((r) => [r.id, r])), [city]);

  // Создание карты при mount
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(),
      center: city.center as LngLat as [number, number],
      zoom: 11.5,
      attributionControl: { compact: true },
      cooperativeGestures: false,
      pitchWithRotate: false,
      dragRotate: false,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    if (!hasMaptilerKey()) {
      // Атрибуция для fallback OSM-стиля
      map.addControl(
        new maplibregl.AttributionControl({ compact: true, customAttribution: "" }),
        "bottom-right",
      );
    }
    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Лёт между городами — анимированно
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: city.center as LngLat as [number, number],
      zoom: 11.5,
      duration: 1200,
      essential: true,
    });
  }, [city.slug, city.center]);

  // Полилиния выбранного маршрута + остановки
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRouteLayer = (): void => {
      const existingSource = map.getSource(ROUTE_LINE_SOURCE);
      if (highlightedRoute) {
        const geojson = {
          type: "FeatureCollection" as const,
          features: [
            {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "LineString" as const,
                coordinates: highlightedRoute.geometry.map((p) => [p[0], p[1]]),
              },
            },
          ],
        };
        if (existingSource && "setData" in existingSource) {
          (existingSource as maplibregl.GeoJSONSource).setData(geojson);
        } else {
          map.addSource(ROUTE_LINE_SOURCE, { type: "geojson", data: geojson });
          map.addLayer({
            id: ROUTE_LINE_GLOW,
            type: "line",
            source: ROUTE_LINE_SOURCE,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": highlightedRoute.color,
              "line-width": 10,
              "line-opacity": 0.18,
              "line-blur": 4,
            },
          });
          map.addLayer({
            id: ROUTE_LINE_LAYER,
            type: "line",
            source: ROUTE_LINE_SOURCE,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": highlightedRoute.color,
              "line-width": 4,
              "line-opacity": 0.95,
            },
          });
        }

        if (showStops) {
          const stopsData = {
            type: "FeatureCollection" as const,
            features: highlightedRoute.stops.map((s) => ({
              type: "Feature" as const,
              properties: { id: s.id, name: s.name.ru, order: s.order },
              geometry: {
                type: "Point" as const,
                coordinates: [s.location[0], s.location[1]],
              },
            })),
          };
          const stopSource = map.getSource(STOP_SOURCE);
          if (stopSource && "setData" in stopSource) {
            (stopSource as maplibregl.GeoJSONSource).setData(stopsData);
          } else {
            map.addSource(STOP_SOURCE, { type: "geojson", data: stopsData });
            map.addLayer({
              id: STOP_LAYER,
              type: "circle",
              source: STOP_SOURCE,
              paint: {
                "circle-radius": 5,
                "circle-color": "#0c1118",
                "circle-stroke-color": highlightedRoute.color,
                "circle-stroke-width": 2,
              },
            });
          }
        } else if (map.getLayer(STOP_LAYER)) {
          map.removeLayer(STOP_LAYER);
          if (map.getSource(STOP_SOURCE)) map.removeSource(STOP_SOURCE);
        }
      } else {
        if (map.getLayer(ROUTE_LINE_LAYER)) map.removeLayer(ROUTE_LINE_LAYER);
        if (map.getLayer(ROUTE_LINE_GLOW)) map.removeLayer(ROUTE_LINE_GLOW);
        if (map.getSource(ROUTE_LINE_SOURCE)) map.removeSource(ROUTE_LINE_SOURCE);
        if (map.getLayer(STOP_LAYER)) map.removeLayer(STOP_LAYER);
        if (map.getSource(STOP_SOURCE)) map.removeSource(STOP_SOURCE);
      }
    };

    if (map.isStyleLoaded()) {
      applyRouteLayer();
    } else {
      map.once("load", applyRouteLayer);
    }
  }, [highlightedRoute, showStops]);

  // Маркеры
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const known = markersRef.current;
    const incomingIds = new Set<string>();

    for (const pos of positions) {
      const route = routesById.get(pos.routeId);
      if (!route) continue;
      incomingIds.add(pos.busId);
      const active = highlightedRoute?.id === pos.routeId;
      const existing = known.get(pos.busId);
      if (existing) {
        existing.marker.setLngLat(pos.location as readonly number[] as [number, number]);
        // Перерисуем SVG-инлайн чтобы обновить bearing / status / active
        const fresh = makeMarkerEl(route.shortName, route.color, pos.bearing, pos.status, active);
        existing.el.replaceChildren(...Array.from(fresh.childNodes));
        existing.el.style.opacity = pos.status === "operating" ? "1" : "0.7";
        if (active) existing.el.style.filter = `drop-shadow(0 0 14px ${route.color})`;
        else existing.el.style.filter = "";
      } else {
        const el = makeMarkerEl(route.shortName, route.color, pos.bearing, pos.status, active);
        if (onSelectBus) {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelectBus(pos.busId);
          });
        }
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(pos.location as readonly number[] as [number, number])
          .addTo(map);
        known.set(pos.busId, { marker, el });
      }
    }

    // Удаление исчезнувших
    for (const [id, entry] of known) {
      if (!incomingIds.has(id)) {
        entry.marker.remove();
        known.delete(id);
      }
    }
  }, [positions, routesById, highlightedRoute, onSelectBus]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: "var(--bg-elevated)" }}
      aria-label="map"
    />
  );
}
