"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Clock4, Eye, EyeOff, Gauge } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BusMapClient } from "@/components/BusMapClient";
import { ErrorState } from "@/components/ErrorState";
import { LiveDot } from "@/components/LiveDot";
import { useLiveFeed } from "@/hooks/useLiveFeed";
import { cumulativeLengths } from "@/lib/geo";
import { rowReveal, staggerContainer } from "@/styles/motion";
import type { Locale } from "@/i18n/routing";
import type { City, Route } from "@/types/transit";

interface RouteViewProps {
  city: City;
  route: Route;
  locale: Locale;
}

function etaMinutes(
  route: Route,
  stopOrder: number,
  positions: readonly { routeId: string; segmentIndex: number; progressOnSegment: number }[],
): number | null {
  if (positions.length === 0) return null;
  const cumulative = cumulativeLengths(route.geometry);
  const totalMeters = cumulative[cumulative.length - 1] ?? 0;
  if (totalMeters === 0) return null;
  let best: number | null = null;
  for (const p of positions) {
    if (p.routeId !== route.id) continue;
    const stopMeters = cumulative[Math.min(stopOrder - 1, cumulative.length - 1)] ?? totalMeters;
    const busSegStart = cumulative[p.segmentIndex] ?? 0;
    const busSegEnd = cumulative[p.segmentIndex + 1] ?? busSegStart;
    const busMeters = busSegStart + (busSegEnd - busSegStart) * p.progressOnSegment;
    if (busMeters > stopMeters) continue;
    const mins = (stopMeters - busMeters) / 1000 / 0.42;
    if (best === null || mins < best) best = mins;
  }
  if (best === null) return null;
  return Math.max(0, Math.round(best));
}

export function RouteView({ city, route, locale }: RouteViewProps): React.ReactElement {
  const tCity = useTranslations("city");
  const tRoute = useTranslations("route");
  const tCommon = useTranslations("common");
  const [tracking, setTracking] = useState(true);
  const feed = useLiveFeed(city.slug, { intervalMs: 5000 });

  const longName = (locale === "kk" ? route.longName.kk : route.longName.ru).replace(
    /^TODO_KZ:/,
    "",
  );

  const positionsForRoute = useMemo(
    () => (feed.data?.positions ?? []).filter((p) => p.routeId === route.id),
    [feed.data, route.id],
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/city/${city.slug}`}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="size-3.5" />
            {tCity("backToList")}
          </Link>
          <Badge
            variant="outline"
            className="border-[var(--border)]/60 font-mono text-[10px] tracking-wider uppercase"
          >
            {city.name.ru}
          </Badge>
        </div>

        <Card className="bg-card/70 border-border/60">
          <CardContent className="space-y-4 py-5">
            <div className="flex items-center gap-3">
              <div
                className="grid size-12 shrink-0 place-items-center rounded-lg font-mono text-base font-bold"
                style={{
                  background: `${route.color}26`,
                  color: route.color,
                  boxShadow: `inset 0 0 0 1px ${route.color}55`,
                }}
                aria-hidden
              >
                {route.shortName}
              </div>
              <div className="min-w-0">
                <div className="font-display truncate text-lg font-semibold tracking-tight">
                  {longName}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {tRoute(`kind.${route.kind}`)} ·{" "}
                  {tRoute("headwayValue", { minutes: route.headwayMinutes })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-surface-2 rounded-md p-2">
                <div className="text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
                  {tRoute("scheduleTitle")}
                </div>
                <div className="font-mono text-xs">
                  {route.operatingHours.from}–{route.operatingHours.to}
                </div>
              </div>
              <div className="bg-surface-2 rounded-md p-2">
                <div className="text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
                  {tCity("busesOnline", { count: 0 }).replace(/\d+\s*/, "")}
                </div>
                <div className="font-mono text-xs">{positionsForRoute.length}</div>
              </div>
              <div className="bg-surface-2 rounded-md p-2">
                <div className="text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
                  {tCity("stopsCount", { count: 0 }).replace(/\d+\s*/, "")}
                </div>
                <div className="font-mono text-xs">{route.stops.length}</div>
              </div>
            </div>

            <Button
              variant={tracking ? "default" : "outline"}
              className="w-full gap-2"
              onClick={() => setTracking((t) => !t)}
            >
              {tracking ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {tracking ? tRoute("tracking") : tRoute("track")}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardContent className="py-5">
            <h2 className="font-display mb-2 text-xs font-medium tracking-wider text-[var(--text-muted)] uppercase">
              {tRoute("stopsTitle")}
            </h2>
            <Separator className="mb-2" />
            <motion.ol variants={staggerContainer} initial="hidden" animate="visible">
              {route.stops.map((s) => {
                const eta = etaMinutes(route, s.order, positionsForRoute);
                const display = (locale === "kk" ? s.name.kk : s.name.ru).replace(/^TODO_KZ:/, "");
                return (
                  <motion.li
                    key={s.id}
                    variants={rowReveal}
                    className="border-border/30 flex items-center gap-3 border-b py-2.5 last:border-b-0"
                  >
                    <div className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] font-mono text-[10px]">
                      {s.order}
                    </div>
                    <div className="flex-1 truncate text-sm">{display}</div>
                    <div className="flex shrink-0 items-center gap-1 text-xs">
                      {eta === null ? (
                        <span className="text-[var(--text-subtle)]">—</span>
                      ) : (
                        <>
                          <Clock4 className="size-3 text-[var(--text-muted)]" />
                          <span className="font-mono">
                            {eta}
                            {tCommon("minutesShort")}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ol>
          </CardContent>
        </Card>

        {feed.status === "error" && feed.error ? (
          <ErrorState
            description={feed.error.message}
            onRetry={feed.refetch}
            className="px-4 py-3"
          />
        ) : null}
      </aside>

      <section className="bg-bg-elevated relative h-[calc(100dvh-var(--header-h)-3rem)] min-h-[480px] overflow-hidden rounded-xl border border-[var(--border)]/60">
        <div className="bg-bg/80 border-border/60 absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] backdrop-blur">
          <LiveDot
            status={
              feed.status === "error"
                ? "offline"
                : feed.data?.source === "upstream"
                  ? "live"
                  : "delayed"
            }
            size="sm"
          />
          <span className="font-mono tracking-wider text-[var(--text-muted)] uppercase">
            {feed.data?.source === "upstream" ? tCity("sourceLive") : tCity("sourceSimulated")}
          </span>
          {positionsForRoute.length > 0 && (
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              <Bus className="mr-1 inline size-3" />
              {positionsForRoute.length}
            </span>
          )}
          {positionsForRoute[0]?.speedKmh !== undefined && (
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              <Gauge className="mr-1 inline size-3" />
              {Math.round(positionsForRoute[0].speedKmh)} км/ч
            </span>
          )}
        </div>
        <BusMapClient
          city={city}
          positions={tracking ? positionsForRoute : []}
          highlightedRoute={route}
          showStops
        />
      </section>
    </div>
  );
}
