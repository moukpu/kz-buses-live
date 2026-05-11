import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { cities } from "@/content/cities";
import { locales, defaultLocale } from "@/i18n/routing";

/**
 * Sitemap = lending + 12 city pages + все routes × 2 локали.
 * alternates.languages для hreflang ru/kk.
 *
 * Owner: архитектура (Миша). Лендинг и static-страницы (`/about`, `/data-sources`)
 * Костя добавит когда будут готовы — добавишь сюда новый блок.
 */

const baseUrl = siteConfig.url.replace(/\/$/, "");

function localizedPath(locale: string, path: string): string {
  const cleanPath = path === "/" ? "" : path;
  if (locale === defaultLocale) return `${baseUrl}${cleanPath}`;
  return `${baseUrl}/${locale}${cleanPath}`;
}

function withAlternates(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = localizedPath(loc, path);
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Главная.
  entries.push({
    url: localizedPath(defaultLocale, "/"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
    alternates: withAlternates("/"),
  });

  // Static-страницы.
  for (const path of ["/about", "/data-sources"] as const) {
    entries.push({
      url: localizedPath(defaultLocale, path),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: withAlternates(path),
    });
  }

  // Города + маршруты.
  for (const city of cities) {
    const cityPath = `/city/${city.slug}`;
    entries.push({
      url: localizedPath(defaultLocale, cityPath),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: withAlternates(cityPath),
    });

    for (const route of city.routes) {
      const routePath = `/city/${city.slug}/route/${route.id}`;
      entries.push({
        url: localizedPath(defaultLocale, routePath),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
        alternates: withAlternates(routePath),
      });
    }
  }

  return entries;
}
