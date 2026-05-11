# kz-buses-live · Design System

Premium real-time bus tracking for 12 cities of Kazakhstan. Dark-first,
calm-confident, «Apple Maps × Citymapper × Яндекс.Транспорт».

> Source of truth for tokens lives in
> [`src/styles/tokens.css`](../src/styles/tokens.css);
> motion primitives in [`src/styles/motion.ts`](../src/styles/motion.ts).
> Tailwind v4 — there is **no** `tailwind.config.ts`; the @theme block in
> [`src/styles/globals.css`](../src/styles/globals.css) wires CSS variables
> straight into utility classes (`bg-surface`, `text-live`, `rounded-lg`).

---

## 1 · Mood board

| Reference                  | What we steal                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Apple Maps (iOS, dark)** | Graphite surfaces, precise typography, _quiet_ motion of map markers — none of the cheap parallax tricks.           |
| **Citymapper**             | Route-card density, color-coded transit types, ETA-first information hierarchy. Cards that survive low-info.        |
| **Яндекс.Транспорт**       | Live markers on a Cyrillic UI, sensible localisation, big tap targets — proves the pattern works for our user base. |
| **Linear.app**             | Premium dark, restrained gradients, springs over tweens. The upper bound of «вычурность» we allow ourselves.        |

What we **don't** copy: flat-shaded illustrations, animated mascots, neon
gradients, glassmorphism over everything. The product is a map — the design
must _defer_ to the map.

---

## 2 · Palette (OKLCH)

Dark is `:root`. Light is opt-in via `[data-theme="light"]` — older users
in well-lit indoor settings need a usable light theme; everyone else stays
on dark. All shadcn semantic aliases (`--background` / `--primary` /
`--ring` / …) point at the brand palette, so swapping a palette token here
propagates to every UI primitive automatically.

### Dark · primary

| Token           | OKLCH                      | Role                                                              |
| --------------- | -------------------------- | ----------------------------------------------------------------- |
| `--bg`          | `oklch(14% .02 250)`       | Page background, deepest graphite.                                |
| `--bg-elevated` | `oklch(17% .02 250)`       | Sticky header, modal scrim base.                                  |
| `--surface`     | `oklch(20% .02 250)`       | Cards, list rows.                                                 |
| `--surface-2`   | `oklch(25% .02 250)`       | Hovered/active card, popover.                                     |
| `--surface-3`   | `oklch(30% .02 250)`       | Pressed state, scrollbar thumb.                                   |
| `--text`        | `oklch(96% .01 250)`       | Primary text. Contrast on `--bg`: **13.4 : 1** — AAA at any size. |
| `--text-muted`  | `oklch(72% .02 250)`       | Secondary text, captions. Contrast: **6.4 : 1** — AA.             |
| `--text-subtle` | `oklch(55% .02 250)`       | Decorative captions only — meets AA at 18 pt+.                    |
| `--border`      | `oklch(30% .02 250 / .55)` | Hairline dividers, card outlines.                                 |
| `--accent`      | `oklch(72% .15 220)`       | Electric teal — CTA, focus ring, live-now affordances.            |
| `--accent-fg`   | `oklch(14% .02 250)`       | Text on accent surfaces.                                          |
| `--accent-glow` | `oklch(72% .15 220 / .35)` | Used in `--shadow-glow` for hovered CTA.                          |
| `--live`        | `oklch(74% .18 150)`       | Green — bus is reporting in real time.                            |
| `--delayed`     | `oklch(80% .16 75)`        | Amber — delayed beyond 3 min.                                     |
| `--offline`     | `oklch(58% .02 250)`       | Neutral grey — last seen >5 min ago.                              |
| `--danger`      | `oklch(65% .21 27)`        | Error states, destructive actions.                                |

### Light · opt-in

`--bg → oklch(98% .005 250)`, `--text → oklch(20% .02 250)` (contrast
**14.1 : 1**), `--accent → oklch(55% .16 220)` (deeper teal — needs more
chroma to read on near-white). Statuses are recoloured proportionally;
see `tokens.css` for the full block.

---

## 3 · Typography

Three voices, deliberate roles. All three carry both `cyrillic` and
`cyrillic-ext` Google Fonts subsets — the latter is what ships
ң / ғ / ұ / қ / ө / һ / і. Dropping it silently breaks Kazakh, so keep it.

| Voice       | Family         | Used for                                                               |
| ----------- | -------------- | ---------------------------------------------------------------------- |
| **Display** | Unbounded      | Hero headline, large section titles, metric numbers in hero.           |
| **Body**    | Inter          | All UI text — buttons, list rows, cards, captions.                     |
| **Mono**    | JetBrains Mono | ETA minutes, route numbers, coordinates, time stamps. Tabular figures. |

### Type scale (rem · Tailwind utility)

| Token          | Size                         | Use                                          |
| -------------- | ---------------------------- | -------------------------------------------- |
| `text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | Hero headline — fluid                        |
| `text-h1`      | `2rem` · `text-3xl`          | Section h1 (city name)                       |
| `text-h2`      | `1.5rem` · `text-2xl`        | Card titles, route name                      |
| `text-h3`      | `1.25rem` · `text-xl`        | Sub-section, route number block              |
| `text-body`    | `1rem` · `text-base`         | Default body                                 |
| `text-sm`      | `0.875rem`                   | Captions, helper text                        |
| `text-xs`      | `0.75rem`                    | Mono code labels, dense metadata             |
| `text-eta`     | `1.75rem` mono, tabular      | The ETA number on `<RouteCard>` / stop sheet |

KZ length: assume **+20%** vs Russian. Hero copy, button labels and card
titles must fit gracefully — leave headroom in containers, never set
`white-space: nowrap` on user-visible strings.

---

## 4 · Spacing · Radius · Elevation

**Spacing** — 4 px scale (`--space-1` = 4 px … `--space-24` = 96 px). Use
Tailwind utilities (`gap-2`, `p-6`) by default; reach for the named tokens
only when constructing custom layout primitives (split-view widths,
sheet-handle heights).

**Radius** — `--radius-xs 4` · `sm 8` · `md 12` · `lg 20` · `xl 28` ·
`2xl 40` · `full ∞`. Default for cards/buttons is `md`; bottom-sheet
top edge is `xl`; route-list panel is `lg`. Avoid `xs` and `2xl` on text
containers — they read either too sharp or too cartoonish.

**Elevation** — five tiers, all tuned to the dark surface (drop shadows
use OKLCH black with progressive blur). Reserved roles:

| Tier            | Use                                         |
| --------------- | ------------------------------------------- |
| `--shadow-xs`   | Hairline lift (focus rings, hovered chip)   |
| `--shadow-sm`   | Resting card                                |
| `--shadow-md`   | Hovered card, sticky header                 |
| `--shadow-lg`   | Bottom sheet, dropdown popover              |
| `--shadow-xl`   | Modal dialog                                |
| `--shadow-glow` | Hovered primary CTA, focused live-indicator |

---

## 5 · Component inventory

### Shadcn primitives (already installed)

`Button`, `Card`, `Badge`, `Sheet`, `Command`, `Dialog`, `Tooltip`,
`Skeleton`, `ScrollArea`. Costya consumes them as-is; they already
inherit the brand palette through the @theme inline block.

### Bespoke components (Costya's queue)

| Component         | Job                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `<MapShell>`      | MapLibre wrapper — branded map style (dark default, light alt), attribution chip, loading skeleton.      |
| `<BusMarker>`     | Map pin: route number + direction arrow + status color (`live` / `delayed` / `offline`). Springs on tap. |
| `<LiveDot>`       | 8 px pulsing dot, 3 states. Pure CSS (works under SSR without flash).                                    |
| `<RouteCard>`     | Route number block (mono) + route name + first/last stop + ETA bar + follow-button.                      |
| `<ETABar>`        | Horizontal progress 0 → 100 % showing «bus approaching stop». Count-up on the minutes label.             |
| `<CityPicker>`    | Pill row of 12 cities for `lg+`; collapses to a `<Command>` ⌘K palette on `sm/md`.                       |
| `<BottomSheet>`   | Mobile stop-detail. Drag-handle, three snap points (peek / half / full). Uses `vaul` or hand-rolled.     |
| `<StatusChip>`    | Tiny badge (live / delayed / offline / soon) — used in city tiles, route lists, marker callouts.         |
| `<WarningBanner>` | Region-wide notices ("маршрут #34 не ходит до 14:00 — ремонт"). Soft-color, dismissible.                 |

### States (every list / surface must render all four)

| State       | Visual                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------- |
| **Loading** | `.skeleton` shimmer (branded; **not** default shadcn `<Skeleton>`).                            |
| **Empty**   | Lucide icon + 1-line Russian copy + secondary action ("Открыть карту", "Сменить город").       |
| **Error**   | Soft danger banner, plain-language Russian copy, **retry** button. Never expose a stacktrace.  |
| **Offline** | Banner top of viewport, `--offline`-colored, "Нет соединения · последние данные NN мин назад". |

---

## 6 · Screens (ascii sketches)

### 6.1 Hero (`/`)

```
┌───────────────────────────────────────────────────────────┐
│  KZ  •  kz-buses-live      Города  О сервисе   GitHub     │  <- 64-px header, --bg-elevated
├───────────────────────────────────────────────────────────┤
│                                                           │
│   ▍ live now                                              │  <- pill badge --accent-soft
│                                                           │
│   Автобусы Казахстана                                     │  <- display, fluid clamp(2.5,6vw,4.5)
│   в реальном времени                                      │
│                                                           │
│   12 городов · обновление каждые 15 секунд · карта        │  <- text-muted, max-w-2xl
│                                                           │
│   ┌──────────────────────┐  ┌───────────────┐             │
│   │  Открыть карту  →    │  │  Как это      │             │
│   │  (--accent / glow)   │  │  работает     │             │
│   └──────────────────────┘  └───────────────┘             │
│                                                           │
│                                                           │
│   ┌── KAZAKHSTAN  silhouette (svg, animated) ──┐          │  <- 12 city dots,
│   │   • Алматы (pulse)                          │          │     pulse staggered
│   │     • Астана (pulse)                        │          │     by 150 ms
│   │            ...10 more pulse dots            │          │
│   └──────────────────────────────────────────────┘         │
│                                                           │
│   ┌──[Realtime]──┐ ┌──[12 городов]──┐ ┌──[RU + KZ]──┐    │  <- 3 feature cards
│   │ Apple-Maps   │ │ От Алматы до   │ │ next-intl,    │   │
│   │ -level …     │ │ Кызылорды.     │ │ ARIA …        │   │
│   └──────────────┘ └────────────────┘ └───────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Motion: hero headline reveals word-by-word (`heroWord` variant, 60 ms
stagger). Country silhouette uses parallax on `Y` scroll up to ~80 px;
city dots pulse on a staggered loop (`live-pulse` keyframes).
CTA hover swaps to `--accent-hover` + adds `--shadow-glow`.

### 6.2 City screen (`/g/almaty`) — split layout

```
┌──────────────────────────── 1280 px ────────────────────────────┐
│ ◀  Алматы   [Маршруты] [Остановки]            🔍 Поиск          │  <- 64-px sticky header
├─────────────── 420 px ───────────┬──────────── 860 px ──────────┤
│ ┌─ 8 ─┐  8А · Площадь — Аэропорт│                              │
│ │ 8А  │  • live   ETA 4 мин     │                              │
│ │ live│  ▭▭▭▭▭▭▭▱▱▱▱▱▱▱▱▱▱▱▱   │                              │
│ └─────┘                          │                              │
│ ┌─16──┐  16  · Сайран — Талгар  │                              │
│ │ 16  │  • live   ETA 12 мин    │                              │
│ │ live│  ▭▭▭▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   │                              │
│ └─────┘                          │      <MapShell>              │
│ ┌─34──┐  34 · Алмалы — ВДНХ      │      MapLibre canvas         │
│ │ 34  │  ⏱ delayed              │      <BusMarker>×N           │
│ │delay│  ETA — мин               │      (route 8А, 16, 34…)     │
│ └─────┘                          │                              │
│   …more rows… (scroll-area)      │                              │
│ ┌──────────────────────────────┐ │                              │
│ │ ⓘ маршрут #34 не ходит до    │ │                              │
│ │   14:00 — ремонт <link>     │ │                              │
│ └──────────────────────────────┘ │                              │
│                                  │  attribution · © OSM ·       │
└──────────────────────────────────┴──────────────────────────────┘
```

Motion: city swap = `citySwap` variants on the whole `<main>` (260 ms
soft cross-fade). Route rows stagger in (`rowReveal`, 40 ms). Bus markers
appear with `markerReveal` snap-spring. Selecting a row pans the map
with MapLibre's `flyTo` (650 ms `easeOutQuint`-equivalent).

### 6.3 Route card (detail)

```
┌─ Route ──────────────────────────────────┐
│  ┌─────┐                                  │
│  │ 8А  │  Площадь Республики → Аэропорт   │
│  │live │                                   │
│  └─────┘                                  │
│  ───────────────────────────────────────  │
│  ⓘ Сейчас на линии: 8 автобусов          │
│  ⏱ Следующий через  04 : 21              │   <- mono, tabular, count-up
│  ───────────────────────────────────────  │
│  ◉ → ○ → ○ → ○ → ○ → ○ → ○ → ◉            │   <- mini route diagram
│  Площадь       Сайран       Аэропорт      │
│  ───────────────────────────────────────  │
│  [  ★  Следить за маршрутом  ]           │   <- primary CTA
└──────────────────────────────────────────┘
```

### 6.4 Bottom-sheet — stop detail (mobile)

```
            ──────────              <- drag-handle, 28 px
┌──────────────────────────────────┐
│ Остановка «Аэропорт»             │
│ ул. Майлина · 4 маршрута          │
├──────────────────────────────────┤
│ 8А  Площадь — Аэропорт            │
│     • live   ETA 04 : 21          │   <- mono ETA
│     ▭▭▭▭▭▭▭▭▱▱▱▱▱▱▱▱▱▱▱           │   <- ETABar progress
├──────────────────────────────────┤
│ 16   Сайран — Талгар              │
│     • live   ETA 12 : 04          │
│     ▭▭▭▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱           │
├──────────────────────────────────┤
│   …more…                         │
└──────────────────────────────────┘
```

Three snap points: peek (`24%` viewport), half (`55%`), full (`88%`).
Drag uses spring `spring.base`. ETA numbers count-up on initial mount
and again on every push update (`countUp` transition).

### 6.5 City picker (`<CityPicker>`)

```
lg+:
[ Алматы ] [ Астана ] [ Шымкент ] [ Караганда ] [ Актобе ] [ Тараз ] [ +6 → ⌘K ]

sm/md:
┌─────────────────────────────────────┐
│  🔍 Выберите город …            ⌘K  │
├─────────────────────────────────────┤
│  Алматы       Алматинская агл.   ●  │   <- ● = hasRealtime
│  Астана       Столица             ●  │
│  Шымкент      Туркестанский       ○  │
│  …                                  │
└─────────────────────────────────────┘
```

Pill row uses magnetic-hover (`spring.snap`). Overflow into ⌘K Command
palette (shadcn `<Command>`) at `< 1024 px`.

---

## 7 · Motion language

| Pattern                | Implementation                                                   | Where                                             |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Word-by-word reveal    | `heroWord` variant, 60 ms stagger                                | Hero headline                                     |
| Section reveal         | `sectionReveal`, `whileInView`, viewport-once                    | Feature blocks, city grid                         |
| Card hover lift        | `cardHover` (rest / hover / tap), `spring.snap`                  | `<RouteCard>`, city tiles, feature cards          |
| List row stagger       | `staggerContainer` + `rowReveal`, 40–50 ms                       | Route list, stop list, city dropdown              |
| Marker entrance        | `markerReveal`, `spring.snap`                                    | `<BusMarker>` mount / route filter change         |
| Page / city transition | `citySwap` exit/enter, ~260 ms                                   | Top-level `<AnimatePresence>` around city content |
| Bottom-sheet           | `bottomSheet` variants, `spring.base`, three snap points         | `<BottomSheet>` (mobile)                          |
| Count-up               | `useMotionValue` + `useTransform`, `countUp` transition          | ETA numbers, route counts                         |
| Live pulse             | CSS `live-pulse` keyframes — survives SSR                        | `<LiveDot>`, hero map dots                        |
| Ripple on tap          | Pointer-down → expanding `<span>` from coords, fades over 360 ms | Buttons, list rows (mobile)                       |

All durations / easings are also exposed as CSS variables — see the
`Motion` block in `tokens.css`. Components without a runtime can use the
CSS values directly (e.g. `transition: transform var(--d-base) var(--ease-spring)`).

Reduced motion: `prefers-reduced-motion: reduce` collapses all CSS
durations to `1 ms`. Framer Motion respects `useReducedMotion()`
automatically — set `reducedMotion="user"` on the root `MotionConfig` to
make it global.

---

## 8 · Signature element (anti-template)

This is the moment that makes the site **kz-buses-live** and not
"any Next + Tailwind transit lander". Two concrete commitments:

1. **Hero map silhouette with staggered pulse.** A simplified Kazakhstan
   SVG, 12 city dots positioned by `cities.ts` coords, each pulses with
   `--live` color on a staggered loop (150 ms delay between cities by
   alphabet order). The pulse intensity is **content-aware** — cities
   with `hasRealtime: true` pulse on a 1.8 s loop; `false` cities show a
   static `--offline` dot. The map is the brand.

2. **Route number block.** Mono-typeset 3-character chip (`8А`, `16`,
   `34`) inside a tilted rectangle (-3°) with a subtle silver inner-border
   and the route's status color leaking from the bottom edge. Used on
   every `<RouteCard>`, `<BusMarker>` callout, and stop sheet — it's the
   recurring brand mark, like a Citymapper line-bar but transit-numbered.
   See `<RouteCard>` mock in §6.3.

Avoid: full-bleed parallax hero of a generic city skyline, sparkle
backgrounds, ambient particle fields. None of those advance the product.

---

## 9 · Wiring notes (handoff)

- **Костя** — to activate fonts: in
  [`src/app/layout.tsx`](../src/app/layout.tsx) replace the current
  `Geist`/`Geist_Mono` imports with:

  ```ts
  import { fontDisplay, fontBody, fontMono } from "@/styles/fonts";
  …
  <body
    className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased`}
  >
  ```

  Until that swap lands, the site renders in Geist (cyrillic OK,
  partial KZ coverage). Browser/CI builds still pass.

- **Костя** — for new shadcn components: keep `style: new-york`,
  `baseColor: zinc`, and `cssVariables: true` from `components.json`.
  Any CLI-generated component will inherit the brand palette through
  the @theme inline block automatically. **Do not** override
  shadcn `--primary` locally — change it once in `tokens.css`.

- **Миша** — content for `<WarningBanner>` and empty-states should be
  short, plain Russian. Avoid technical wording in user-facing copy
  ("сессия истекла" → "Заново откройте страницу — данные устарели").

- **Лёня** — no env changes needed for design system. Vercel preview
  builds will render with system fonts on first paint and swap to
  Google Fonts as `next/font` resolves; expected, no action.

- **TODO (next round)** — illustration set for the empty/error/offline
  states (Lucide alone reads too "generic"); MapLibre dark/light style
  JSON for `<MapShell>` (placeholder until Lenya wires the tile source).
