"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cardHover, cardReveal } from "@/styles/motion";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { Route } from "@/types/transit";

interface RouteCardProps {
  route: Route;
  locale: Locale;
  /** Сколько автобусов сейчас в живом фиде. */
  liveCount?: number;
  active?: boolean;
  onClick?: (route: Route) => void;
}

export function RouteCard({
  route,
  locale,
  liveCount = 0,
  active = false,
  onClick,
}: RouteCardProps): React.ReactElement {
  const tCity = useTranslations("city");
  const tRoute = useTranslations("route");
  const longName = locale === "kk" ? route.longName.kk : route.longName.ru;
  const kindLabel = tRoute(`kind.${route.kind}`);

  return (
    <motion.div variants={cardReveal} initial={false}>
      <motion.button
        type="button"
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onClick={() => onClick?.(route)}
        className="block w-full text-left"
      >
        <Card
          className={cn(
            "bg-card/70 border-border/60 transition-colors hover:border-[var(--accent)]/40",
            active && "border-[var(--accent)] bg-[var(--surface-2)]",
          )}
        >
          <CardContent className="flex items-center gap-3 py-3.5">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-md font-mono text-sm font-bold"
              style={{
                background: `${route.color}26`,
                color: route.color,
                boxShadow: `inset 0 0 0 1px ${route.color}44`,
              }}
              aria-hidden
            >
              {route.shortName}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display truncate text-sm font-medium tracking-tight">
                {longName.replace(/^TODO_KZ:/, "")}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                <span className="font-mono tracking-wider uppercase">{kindLabel}</span>
                <span aria-hidden>·</span>
                <span>{tRoute("headwayValue", { minutes: route.headwayMinutes })}</span>
                {liveCount > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <Badge
                      variant="outline"
                      className="h-4 border-[var(--live)]/40 px-1.5 py-0 font-mono text-[9px] text-[var(--live)] uppercase"
                    >
                      {tCity("busesOnline", { count: liveCount })}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-[var(--text-muted)]" />
          </CardContent>
        </Card>
      </motion.button>
    </motion.div>
  );
}
