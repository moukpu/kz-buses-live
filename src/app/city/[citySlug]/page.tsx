import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CityView } from "@/components/CityView";
import { SiteHeader } from "@/components/SiteHeader";
import { getCity, citySlugs } from "@/content/cities";
import { isLocale, type Locale } from "@/i18n/routing";

interface CityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{ route?: string }>;
}

export async function generateStaticParams(): Promise<Array<{ citySlug: string }>> {
  return citySlugs.map((slug) => ({ citySlug: slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCity(citySlug);
  if (!city) return {};
  return {
    title: `${city.name.ru} · автобусы вживую`,
    description: `Маршруты и движение автобусов в городе ${city.name.ru}. Карта в реальном времени.`,
  };
}

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps): Promise<React.ReactElement> {
  const { citySlug } = await params;
  const { route } = await searchParams;
  const city = getCity(citySlug);
  if (!city) notFound();

  const localeRaw = await getLocale();
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "ru";

  return (
    <div className="min-h-dvh">
      <SiteHeader activeSlug={city.slug} />
      <CityView city={city} locale={locale} selectedRouteId={route ?? null} />
    </div>
  );
}
