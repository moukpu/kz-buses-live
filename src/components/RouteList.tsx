"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { RouteCard } from "@/components/RouteCard";
import { LiveDot } from "@/components/LiveDot";
import { staggerContainer } from "@/styles/motion";
import type { Locale } from "@/i18n/routing";
import type { BusPosition, City, Route } from "@/types/transit";

interface RouteListProps {
  city: City;
  locale: Locale;
  positions: readonly BusPosition[];
  selectedRouteId?: string | null;
  loading?: boolean;
  source?: "simulation" | "upstream" | null;
}

export function RouteList({
  city,
  locale,
  positions,
  selectedRouteId = null,
  loading = false,
  source = null,
}: RouteListProps): React.ReactElement {
  const router = useRouter();
  const tCity = useTranslations("city");
  const [query, setQuery] = useState("");

  const liveByRoute = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of positions) m.set(p.routeId, (m.get(p.routeId) ?? 0) + 1);
    return m;
  }, [positions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return city.routes;
    return city.routes.filter((r) => {
      const haystack = [r.shortName, r.longName.ru, r.longName.kk, r.longName.en]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [city.routes, query]);

  const onSelect = (route: Route): void => {
    router.push(`/city/${city.slug}/route/${route.id}`);
  };

  const sourceLabel =
    source === "upstream"
      ? tCity("sourceLive")
      : source === "simulation"
        ? tCity("sourceSimulated")
        : null;

  return (
    <aside className="bg-bg/95 border-border/50 flex h-full flex-col border-r" aria-label="routes">
      <div className="border-border/40 border-b p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-lg font-semibold tracking-tight">
              {city.routes.length > 0
                ? tCity("routesCount", { count: city.routes.length })
                : tCity("routesTitle")}
            </div>
            {sourceLabel ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <LiveDot status={source === "upstream" ? "live" : "delayed"} size="sm" />
                <span className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
                  {sourceLabel}
                </span>
              </div>
            ) : null}
          </div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {tCity("busesOnline", { count: positions.length })}
          </Badge>
        </div>

        <label className="bg-surface-2 border-border/50 flex items-center gap-2 rounded-md border px-2.5 py-1.5 focus-within:border-[var(--accent)]/60">
          <Search className="size-3.5 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCity("searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
          />
        </label>
      </div>

      <ScrollArea className="flex-1">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2 p-3"
        >
          {loading && positions.length === 0 ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title={tCity("noRoutes")} description={tCity("noRoutesDescription")} />
          ) : (
            filtered.map((route, idx) => (
              <div key={route.id}>
                <RouteCard
                  route={route}
                  locale={locale}
                  liveCount={liveByRoute.get(route.id) ?? 0}
                  active={selectedRouteId === route.id}
                  onClick={onSelect}
                />
                {idx < filtered.length - 1 && <Separator className="my-0.5 opacity-0" />}
              </div>
            ))
          )}
        </motion.div>
      </ScrollArea>
    </aside>
  );
}
