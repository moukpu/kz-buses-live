/**
 * MapLibre style resolver.
 *
 * Если задан `NEXT_PUBLIC_MAPTILER_KEY` — возвращаем премиум-стиль MapTiler
 * (Streets V2, тёмный вариант). Иначе — открытый OSM-raster fallback,
 * сконфигурированный inline (никаких внешних JSON для UI-сборки).
 */
import type { StyleSpecification } from "maplibre-gl";

const MAPTILER_DARK_URL = (key: string): string =>
  `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${encodeURIComponent(key)}`;

/** Inline-стиль OSM-raster: спокойный тёмный фон + растровые тайлы. */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  name: "kz-buses-fallback",
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0c1118" },
    },
    {
      id: "osm",
      type: "raster",
      source: "osm-raster",
      paint: {
        "raster-opacity": 0.55,
        "raster-saturation": -0.8,
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.85,
        "raster-contrast": 0.1,
      },
    },
  ],
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
};

export function getMapStyle(): string | StyleSpecification {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (key && key.length > 0) return MAPTILER_DARK_URL(key);
  return FALLBACK_STYLE;
}

export const hasMaptilerKey = (): boolean => {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  return typeof key === "string" && key.length > 0;
};
