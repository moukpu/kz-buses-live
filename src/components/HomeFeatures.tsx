"use client";

import { motion } from "framer-motion";
import { MapPinned, Radar, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { cardReveal, ease, staggerContainer } from "@/styles/motion";

export function HomeFeatures(): React.ReactElement {
  const t = useTranslations("home");

  const items = [
    {
      icon: <Radar className="size-5" />,
      title: t("features.realtimeTitle"),
      body: t("features.realtimeBody"),
    },
    {
      icon: <MapPinned className="size-5" />,
      title: t("features.mapTitle"),
      body: t("features.mapBody"),
    },
    {
      icon: <Languages className="size-5" />,
      title: t("features.i18nTitle"),
      body: t("features.i18nBody"),
    },
  ];

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("featuresTitle")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            variants={cardReveal}
            whileHover={{ y: -3, transition: { duration: 0.18, ease: ease.out } }}
          >
            <Card className="bg-card/60 border-border/60 group h-full transition-colors hover:border-[var(--accent)]/50">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <div className="bg-surface-2 grid size-10 place-items-center rounded-lg text-[var(--accent)]">
                  {item.icon}
                </div>
                <div className="font-display text-lg font-medium tracking-tight">{item.title}</div>
                <p className="text-sm text-[var(--text-muted)]">{item.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
