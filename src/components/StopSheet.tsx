"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bus, Clock4 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { rowReveal, staggerContainer } from "@/styles/motion";
import { cumulativeLengths } from "@/lib/geo";
import type { Locale } from "@/i18n/routing";
import type { BusPosition, Route } from "@/types/transit";

interface StopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: Route | null;
  locale: Locale;
  positions: readonly BusPosition[];
}

/**
 * Считает грубое ETA в минутах от автобуса до конкретной остановки.
 * Берёт ближайший автобус, считает оставшийся путь по геометрии,
 * умножает на средний минутный темп маршрута.
 */
function etaMinutes(
  route: Route,
  stopOrder: number,
  positions: readonly BusPosition[],
): number | null {
  if (positions.length === 0) return null;
  const cumulative = cumulativeLengths(route.geometry);
  const totalMeters = cumulative[cumulative.length - 1] ?? 0;
  if (totalMeters === 0) return null;
  // Найти ближайший автобус ДО остановки (по порядку остановок)
  let best: number | null = null;
  for (const p of positions) {
    const next = route.stops.find((s) => s.id === p.nextStopId);
    if (!next) continue;
    if (next.order > stopOrder) continue;
    const meters =
      (cumulative[Math.min(stopOrder - 1, cumulative.length - 1)] ?? totalMeters) -
      (cumulative[p.segmentIndex] ?? 0) -
      ((cumulative[p.segmentIndex + 1] ?? 0) - (cumulative[p.segmentIndex] ?? 0)) *
        p.progressOnSegment;
    if (meters < 0) continue;
    // средний темп: 25 км/ч → 0.42 км/мин
    const mins = meters / 1000 / 0.42;
    if (best === null || mins < best) best = mins;
  }
  if (best === null) return null;
  return Math.max(0, Math.round(best));
}

export function StopSheet({
  open,
  onOpenChange,
  route,
  locale,
  positions,
}: StopSheetProps): React.ReactElement {
  const tRoute = useTranslations("route");
  const tCommon = useTranslations("common");

  const longName = useMemo(() => {
    if (!route) return "";
    const name = locale === "kk" ? route.longName.kk : route.longName.ru;
    return name.replace(/^TODO_KZ:/, "");
  }, [route, locale]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-bg max-h-[80dvh] rounded-t-[var(--radius-2xl)] border-t border-[var(--border)] p-0"
      >
        {route ? (
          <>
            <div
              className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[var(--surface-3)]"
              aria-hidden
            />
            <SheetHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div
                  className="grid size-10 place-items-center rounded-md font-mono text-sm font-bold"
                  style={{
                    background: `${route.color}26`,
                    color: route.color,
                    boxShadow: `inset 0 0 0 1px ${route.color}44`,
                  }}
                  aria-hidden
                >
                  {route.shortName}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <SheetTitle className="font-display text-base leading-tight">
                    {longName}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 flex items-center gap-2 text-xs">
                    <span>{tRoute(`kind.${route.kind}`)}</span>
                    <span aria-hidden>·</span>
                    <span>{tRoute("headwayValue", { minutes: route.headwayMinutes })}</span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="max-h-[60dvh] px-5 pb-6">
              <h3 className="font-display mt-3 mb-2 text-xs font-medium tracking-wider text-[var(--text-muted)] uppercase">
                {tRoute("stopsTitle")}
              </h3>
              <Separator className="mb-2" />
              <motion.ol variants={staggerContainer} initial="hidden" animate="visible">
                {route.stops.map((s) => {
                  const eta = etaMinutes(route, s.order, positions);
                  const display = (locale === "kk" ? s.name.kk : s.name.ru).replace(
                    /^TODO_KZ:/,
                    "",
                  );
                  return (
                    <motion.li
                      key={s.id}
                      variants={rowReveal}
                      className="border-border/30 flex items-center gap-3 border-b py-3 last:border-b-0"
                    >
                      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] font-mono text-[10px]">
                        {s.order}
                      </div>
                      <div className="flex-1 truncate text-sm">{display}</div>
                      <div className="flex shrink-0 items-center gap-1 text-xs">
                        {eta === null ? (
                          <span className="text-[var(--text-subtle)]">—</span>
                        ) : (
                          <>
                            <Clock4 className="size-3.5 text-[var(--text-muted)]" />
                            <span className="font-mono">
                              {eta} {tCommon("minutesShort")}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ol>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Bus className="size-3.5" />
                <span>
                  {tRoute("busesNow", {
                    count: positions.filter((p) => p.routeId === route.id).length,
                  })}
                </span>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
