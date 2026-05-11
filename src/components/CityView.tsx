"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ListTree, MapIcon, Wifi, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BusMapClient } from "@/components/BusMapClient";
import { ErrorState } from "@/components/ErrorState";
import { RouteList } from "@/components/RouteList";
import { StopSheet } from "@/components/StopSheet";
import { useLiveFeed } from "@/hooks/useLiveFeed";
import { citySwap } from "@/styles/motion";
import type { Locale } from "@/i18n/routing";
import type { City, Route } from "@/types/transit";

interface CityViewProps {
  city: City;
  locale: Locale;
  selectedRouteId?: string | null;
}

export function CityView({
  city,
  locale,
  selectedRouteId = null,
}: CityViewProps): React.ReactElement {
  const tCity = useTranslations("city");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");
  const [sheetOpen, setSheetOpen] = useState(false);
  const feed = useLiveFeed(city.slug, { intervalMs: 5000 });

  const selectedRoute = useMemo<Route | null>(() => {
    if (!selectedRouteId) return null;
    return city.routes.find((r) => r.id === selectedRouteId) ?? null;
  }, [city.routes, selectedRouteId]);

  // Открыть sheet автоматически при выборе маршрута на mobile
  useEffect(() => {
    if (selectedRoute && typeof window !== "undefined" && window.innerWidth < 768) {
      setSheetOpen(true);
    }
  }, [selectedRoute]);

  const positions = feed.data?.positions ?? [];
  const isOnline = feed.status !== "error";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={city.slug}
        variants={citySwap}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative grid h-[calc(100dvh-var(--header-h))] w-full grid-cols-1 md:grid-cols-[var(--route-list-width)_1fr]"
      >
        {/* Sidebar (desktop) / overlay (mobile when tab=list) */}
        <div
          className={
            mobileTab === "list"
              ? "absolute inset-0 z-[var(--z-route-list)] md:relative md:inset-auto md:z-auto"
              : "hidden md:block"
          }
        >
          <RouteList
            city={city}
            locale={locale}
            positions={positions}
            selectedRouteId={selectedRouteId}
            loading={feed.status === "loading"}
            source={feed.data?.source ?? null}
          />
        </div>

        {/* Map */}
        <div className="relative h-full w-full">
          {!isOnline && (
            <div className="bg-bg/85 absolute top-3 left-1/2 z-[var(--z-toast)] -translate-x-1/2 backdrop-blur">
              <ErrorState
                title={tCity("mapFallback")}
                description={feed.error?.message ?? ""}
                onRetry={feed.refetch}
                className="px-4 py-3"
              />
            </div>
          )}

          {/* Network status pill */}
          <div className="bg-bg/80 border-border/60 absolute top-3 right-3 z-[var(--z-toast)] inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase backdrop-blur">
            {isOnline ? (
              <>
                <Wifi className="size-3 text-[var(--live)]" />
                <span className="text-[var(--text-muted)]">live</span>
              </>
            ) : (
              <>
                <WifiOff className="size-3 text-[var(--danger)]" />
                <span className="text-[var(--text-muted)]">offline</span>
              </>
            )}
          </div>

          <BusMapClient
            city={city}
            positions={positions}
            highlightedRoute={selectedRoute}
            showStops={Boolean(selectedRoute)}
          />
        </div>

        {/* Mobile bottom tab bar */}
        <div className="fixed inset-x-0 bottom-3 z-[var(--z-header)] mx-auto flex w-fit gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)]/90 p-1 backdrop-blur md:hidden">
          <Button
            size="sm"
            variant={mobileTab === "map" ? "default" : "ghost"}
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setMobileTab("map")}
          >
            <MapIcon className="size-3.5" />
            {tCity("openRoute")}
          </Button>
          <Button
            size="sm"
            variant={mobileTab === "list" ? "default" : "ghost"}
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setMobileTab("list")}
          >
            <ListTree className="size-3.5" />
            {tCity("routesTitle")}
          </Button>
        </div>

        <StopSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          route={selectedRoute}
          locale={locale}
          positions={positions}
        />
      </motion.div>
    </AnimatePresence>
  );
}
