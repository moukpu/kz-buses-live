"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KazakhstanSilhouette } from "@/components/KazakhstanSilhouette";
import { LiveDot } from "@/components/LiveDot";
import { duration, ease, heroWord, staggerContainer } from "@/styles/motion";

const PRIMARY_CITY = "almaty";

export function HomeHero(): React.ReactElement {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yMap = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const opacityMap = useTransform(scrollYProgress, [0, 0.8], [0.9, 0.15]);

  const titleWords = t("title").split(" ");

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28"
    >
      {/* Декоративная сетка */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(var(--surface-3) 1px, transparent 1px), linear-gradient(90deg, var(--surface-3) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 80%)",
        }}
      />

      <motion.div
        style={{ y: yMap, opacity: opacityMap }}
        className="pointer-events-none absolute inset-x-0 top-[20%] -z-10 mx-auto w-full max-w-6xl"
      >
        <KazakhstanSilhouette className="h-[520px] w-full opacity-90" />
      </motion.div>

      <motion.div
        style={{ y: yText }}
        className="relative z-10 mx-auto w-full max-w-6xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.base, ease: ease.out }}
        >
          <Badge
            variant="outline"
            className="mb-6 gap-2 border-[var(--accent)]/40 text-[var(--accent)]"
          >
            <LiveDot status="live" size="sm" />
            {t("eyebrow")}
          </Badge>
        </motion.div>

        <motion.h1
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="font-display mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-balance text-[var(--text)] sm:text-6xl md:text-7xl"
        >
          {titleWords.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pr-2 align-bottom">
              <motion.span variants={heroWord} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out, delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-base text-pretty text-[var(--text-muted)] sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href={`/city/${PRIMARY_CITY}`}>
            <Button size="lg" className="gap-2">
              <MapIcon className="size-4" />
              {tCommon("openMap")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="#cities">
            <Button size="lg" variant="outline">
              {t("ctaSecondary")}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
