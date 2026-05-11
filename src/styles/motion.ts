/**
 * kz-buses-live · Motion language
 * --------------------------------------------------------------------------
 * Framer-Motion variants and spring presets shared by every interactive
 * surface. The token CSS-variables (`--d-fast`, `--ease-spring`, …) in
 * `tokens.css` mirror these JS values — keep both in sync if you tune one.
 *
 * Conventions:
 *   - Entrance from below by ~12px, fade in. Distance shrinks as elements
 *     get smaller (markers ~4px, list rows ~6px, cards ~12px, sections ~24px).
 *   - Stagger child reveals (0.04–0.08s) — gives the eye a path to follow.
 *   - Springs over tweens for anything that responds to user input
 *     (card hover, sheet drag, marker tap). Tweens for content reveals.
 *   - Respect `prefers-reduced-motion` — Framer Motion does this automatically
 *     when `useReducedMotion()` is honoured in components.
 *
 * Each variant ships with a hint about *where* it belongs so Костя can
 * grep for the right pattern when building components.
 */
import type { Transition, Variants } from "framer-motion";

/* ----- Durations / easings (seconds — Framer's unit). -------------------- */
export const duration = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
  slower: 0.56,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  in: [0.64, 0, 0.78, 0] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  emph: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  spring: [0.32, 0.72, 0, 1] as [number, number, number, number],
} as const;

/* ----- Spring presets ---------------------------------------------------- */
export const spring = {
  /** Tight, snappy — buttons, marker taps, list-row press. */
  snap: { type: "spring", stiffness: 520, damping: 32, mass: 0.6 } satisfies Transition,
  /** Default — cards, sheet open, panel slide. */
  base: { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } satisfies Transition,
  /** Soft, deliberate — hero entrance, city transition, layout shift. */
  soft: { type: "spring", stiffness: 170, damping: 26, mass: 1.1 } satisfies Transition,
} as const;

/* ============================================================
   Variants
   ============================================================ */

/** Section reveal — used by hero, city panel, feature blocks. */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out, staggerChildren: 0.06 },
  },
};

/** Card reveal — feature cards, route cards, city tiles. */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.base, ease: ease.out },
  },
};

/** Card hover — lift + subtle scale. Use on `<RouteCard>` / city tiles. */
export const cardHover: Variants = {
  rest: { y: 0, scale: 1, transition: spring.base },
  hover: { y: -2, scale: 1.005, transition: spring.snap },
  tap: { y: 0, scale: 0.99, transition: spring.snap },
};

/** List row entrance — staggered by parent. Route list, stop list. */
export const rowReveal: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } },
};

/** Bus marker entrance — drop in with subtle bounce. */
export const markerReveal: Variants = {
  hidden: { opacity: 0, scale: 0.4, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.snap,
  },
};

/** City swap (Алматы → Астана). Soft cross-fade with slight scale. */
export const citySwap: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.emph } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: duration.base, ease: ease.in } },
};

/** Bottom-sheet open. Mobile stop-detail. */
export const bottomSheet: Variants = {
  closed: { y: "100%", transition: spring.base },
  open: { y: 0, transition: spring.base },
};

/** Stagger container — `<motion.ul variants={staggerContainer}>` plus
    child `variants={rowReveal}` gives a clean cascade. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

/** Hero text reveal — word-level, used with split-text helper. */
export const heroWord: Variants = {
  hidden: { opacity: 0, y: "60%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.emph },
  },
};

/** Count-up helper — animate a numeric ETA from prevValue to value.
    Component-side usage:
      const value = useMotionValue(0);
      const display = useTransform(value, (v) => Math.round(v));
      useEffect(() => { animate(value, eta, countUp); }, [eta]); */
export const countUp: Transition = {
  duration: duration.slow,
  ease: ease.out,
};
