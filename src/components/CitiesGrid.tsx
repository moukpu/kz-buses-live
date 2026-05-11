"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cities } from "@/lib/cities";
import { cardHover, cardReveal, staggerContainer } from "@/styles/motion";
import { LiveDot } from "@/components/LiveDot";

export function CitiesGrid(): React.ReactElement {
  const t = useTranslations("home");

  return (
    <motion.section
      id="cities"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="outline" className="mb-3">
            {t("citiesEyebrow")}
          </Badge>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("citiesTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-[var(--text-muted)]">
            {t("citiesSubtitle")}
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <motion.li key={city.slug} variants={cardReveal}>
            <Link href={`/city/${city.slug}`} className="block">
              <motion.div variants={cardHover} initial="rest" whileHover="hover" whileTap="tap">
                <Card className="bg-card/60 border-border/60 group transition-colors hover:border-[var(--accent)]/60">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <div className="font-display flex items-center gap-2 truncate text-base font-medium tracking-tight">
                        {city.nameRu}
                      </div>
                      <div className="truncate text-xs text-[var(--text-muted)]">{city.region}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {city.hasRealtime ? (
                        <LiveDot status="live" size="sm" />
                      ) : (
                        <span className="font-mono text-[10px] tracking-wider text-[var(--text-subtle)] uppercase">
                          soon
                        </span>
                      )}
                      <ArrowUpRight className="size-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
