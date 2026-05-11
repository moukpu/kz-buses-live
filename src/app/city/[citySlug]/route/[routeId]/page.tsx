import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { RouteView } from "@/components/RouteView";
import { SiteHeader } from "@/components/SiteHeader";
import { allRouteIds, getCity, getRoute } from "@/content/cities";
import { isLocale, type Locale } from "@/i18n/routing";

interface RoutePageProps {
  params: Promise<{ citySlug: string; routeId: string }>;
}

export async function generateStaticParams(): Promise<
  Array<{ citySlug: string; routeId: string }>
> {
  return allRouteIds().map(({ citySlug, routeId }) => ({ citySlug, routeId }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { citySlug, routeId } = await params;
  const city = getCity(citySlug);
  const route = getRoute(citySlug, routeId);
  if (!city || !route) return {};
  return {
    title: `№${route.shortName} · ${route.longName.ru} · ${city.name.ru}`,
    description: `Маршрут №${route.shortName} в городе ${city.name.ru}: остановки, расписание и движение автобусов в реальном времени.`,
  };
}

export default async function RoutePage({ params }: RoutePageProps): Promise<React.ReactElement> {
  const { citySlug, routeId } = await params;
  const city = getCity(citySlug);
  const route = getRoute(citySlug, routeId);
  if (!city || !route) notFound();

  const localeRaw = await getLocale();
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "ru";

  return (
    <div className="min-h-dvh">
      <SiteHeader activeSlug={city.slug} />
      <RouteView city={city} route={route} locale={locale} />
    </div>
  );
}
