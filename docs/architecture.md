# Архитектура · `kz-buses-live`

Owner: Миша (архитектор). Эта страница — источник правды по структуре
проекта, контрактам и перф-бюджетам. Любое архитектурное изменение —
через PR на `feat/architecture` с обновлением этого документа.

---

## Сводка решений

| Подсистема       | Выбор                                            | Почему не альтернатива                                                                                     |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Мета-фреймворк   | **Next.js 15** (App Router)                      | Зафиксирован Аркадием. SSR/SSG/ISR из коробки, edge runtime для API.                                       |
| TypeScript       | strict + `noUncheckedIndexedAccess`              | Жёстко ловит off-by-one в работе с массивами стопов и геометрии.                                           |
| Карта            | **MapLibre GL JS**                               | OSS, без mapbox-токена. Тайлы — MapTiler free tier (`NEXT_PUBLIC_MAPTILER_KEY`).                           |
| i18n             | **next-intl 4**                                  | App Router native, RSC-friendly, `defineRouting` + `localePrefix: 'as-needed'`.                            |
| Live-данные      | **Polling 5 s** клиент → `/api/feed/[citySlug]`  | SSE/WebSocket на Vercel дороже и не нужно при 5 с.                                                         |
| Источник позиций | **серверная симуляция**, опц. прокси на upstream | Публичного GTFS-RT для KZ городов сейчас нет. `BUS_FEED_BASE_URL` зарезервирован под прокси.               |
| БД               | **нет** на фазе 1                                | Контент целиком в TS (`src/content/cities.ts`). Drizzle + Postgres подключим, когда появится реальный фид. |
| Rate-limit       | Upstash REST (опц.) + in-memory fallback         | Без новой зависимости (`@upstash/ratelimit` не ставим), прямой fetch к REST API.                           |
| Animations       | **Framer Motion**                                | Зафиксирован Аркадием. Использовать только в client-компонентах.                                           |
| Аналитика        | Vercel Web Analytics + Web Vitals                | Минимум. PostHog/Plausible можно подключить позже.                                                         |

---

## Зоны ответственности

| Папка                                                                    | Owner | Кто меняет                                        |
| ------------------------------------------------------------------------ | ----- | ------------------------------------------------- |
| `src/types/transit.ts`                                                   | Миша  | только архитектура                                |
| `src/content/*.ts`                                                       | Миша  | только архитектура                                |
| `src/lib/feed/*`, `src/lib/geo.ts`, `src/lib/rateLimit.ts`               | Миша  | только архитектура                                |
| `src/app/api/**`                                                         | Миша  | только архитектура                                |
| `src/middleware.ts`, `src/i18n/**`                                       | Миша  | только архитектура                                |
| `messages/*.json` (ключи)                                                | Миша  | архитектура добавляет, переводы могут править все |
| `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx` | Миша  | архитектура                                       |
| `src/lib/cities.ts`, `src/lib/site.ts`                                   | Лёня  | landing metadata                                  |
| `src/app/[locale]/**` (страницы, кроме API)                              | Костя | фронт-имплементация                               |
| `src/components/**`                                                      | Костя | компоненты                                        |
| `src/styles/**`                                                          | Аня   | дизайн                                            |

`src/content/cities.ts` (моя transit-модель) и `src/lib/cities.ts` (Лёнин
landing-skeleton) — два разных файла **по дизайну**. Slug'и одинаковые,
наборы полей дополняют друг друга. Слияние в один источник правды
запланировано на фазу 3, когда landing будет реально потреблять transit-данные.

---

## Дерево директорий (фаза 1, после `feat/architecture`)

```
src/
  app/
    api/feed/[citySlug]/route.ts          # edge GET, CityFeed
    opengraph-image.tsx                   # уже от Лёни
    robots.ts                             # disallow /api/
    sitemap.ts                            # 12 городов × routes × 2 локали
    page.tsx, layout.tsx, ...             # Лёня; Костя расширит на [locale]/
  components/                             # Костина зона (ui/ уже стоит от Лёни)
  content/
    cities.ts                             # 12 городов, ~35 маршрутов
  i18n/
    routing.ts                            # locales + defineRouting
    request.ts                            # locale-aware getRequestConfig
  lib/
    cities.ts                             # landing meta (Лёня)
    feed/
      simulate.ts                         # детерминированная симуляция
    geo.ts                                # haversine, bearing, pointAlongPath
    rateLimit.ts                          # upstash REST + memory fallback
    site.ts                               # siteConfig (Лёня)
    utils.ts                              # cn() (Лёня)
  middleware.ts                           # next-intl
  types/
    transit.ts                            # City / Route / Stop / BusPosition / ...
messages/
  ru.json  kk.json                        # KZ-значения новых ключей = "TODO_KZ:<ru>"
docs/
  architecture.md                         # этот файл
```

---

## Маршруты (URL → файл → стратегия)

| URL                                | Файл                                                                    | Рендеринг                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/` (ru), `/kk` (kk)               | `app/page.tsx` (сейчас) → `app/[locale]/page.tsx` (фаза 2 — Костя)      | SSG, revalidate 1d                                                               |
| `/city/[citySlug]`                 | `app/[locale]/city/[citySlug]/page.tsx` (Костя, фаза 2)                 | SSG через `generateStaticParams` (12 городов × 2 локали = 24), карта client-side |
| `/city/[citySlug]/route/[routeId]` | `app/[locale]/city/[citySlug]/route/[routeId]/page.tsx` (Костя, фаза 2) | SSG + client live (polling)                                                      |
| `/about`, `/data-sources`          | `app/[locale]/about/page.tsx`, etc. (Костя, фаза 2)                     | SSG                                                                              |
| `GET /api/feed/[citySlug]`         | `app/api/feed/[citySlug]/route.ts` (Миша)                               | edge runtime, `dynamic = 'force-dynamic'`, no-cache                              |
| `/sitemap.xml`                     | `app/sitemap.ts`                                                        | dynamic build-time                                                               |
| `/robots.txt`                      | `app/robots.ts`                                                         | static                                                                           |
| `/opengraph-image`                 | `app/opengraph-image.tsx`                                               | edge `ImageResponse`                                                             |

> Фаза 1 не размещает `app/[locale]/...` — Лёня собрал бутстрап с flat
> `app/page.tsx`, перенос делает Костя. Middleware уже поднят и работает
> в режиме `as-needed`: `/kk/...` пройдёт через next-intl сразу.

---

## API-контракт: `/api/feed/[citySlug]`

```ts
// GET /api/feed/almaty
// runtime: 'edge', dynamic: 'force-dynamic'
// Headers: Cache-Control: no-store
//
// 200 application/json → CityFeed (src/types/transit.ts)
//   {
//     citySlug: 'almaty',
//     generatedAt: '2026-05-11T12:34:56.000Z',
//     source: 'simulation' | 'upstream',
//     positions: BusPosition[]
//   }
//
// 404 → { error: 'city_not_found', message: string }
// 429 → { error: 'rate_limited', message, retryAfterSec }
// 400 → { error: 'bad_request', message }
//
// Response headers:
//   X-RateLimit-Remaining: <int>
//   X-RateLimit-Source: 'upstash' | 'memory'
//   Retry-After: <sec>   (только при 429)
```

Симуляция (`src/lib/feed/simulate.ts`) — чистая функция от `(City, nowMs)`:

1. Для каждого маршрута: `loopMin = max(15, lenKm × 2.4)`, `N = ceil(loopMin / headway)`.
2. `phase = (nowMs % loopMs) / loopMs`, каждый автобус смещён на `i/N`.
3. По фазе ищем точку на полилинии (`pointAlongPath`), считаем bearing и `nextStopId`.
4. Если сейчас вне `operatingHours` (с tz города) — маршрут не отдаёт автобусов.

Stateless, детерминирован — два запроса в одну ту же миллисекунду дают тот же ответ.

---

## Перф-бюджет

| Метрика                 | Цель         | Как держим                                                                                          |
| ----------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| LCP (4G mobile, `/`)    | **< 2.5 s**  | Hero без 3D и MapLibre; картинки через `next/image` + AVIF/WebP                                     |
| LCP (city/route)        | < 2.8 s      | Poster карты сразу, MapLibre догружаем после first paint                                            |
| Бандл `/` (gzip)        | **< 200 KB** | shadcn tree-shake; `framer-motion` и `maplibre-gl` — только на интерактивных секциях, через dynamic |
| Бандл city/route (gzip) | < 380 KB     | MapLibre core ≈ 200 KB, отдаётся через `next/dynamic({ ssr: false })`                               |
| CLS                     | < 0.1        | Фикс-высота у карты, skeleton'ы у списков                                                           |
| Polling                 | 5 s          | `setInterval` + `AbortController` при unmount, пауза при `document.hidden`                          |
| `/api/feed` p95         | < 150 ms     | Edge runtime, чистая функция от `Date.now()`, без БД                                                |

---

## SEO

- **sitemap** (`src/app/sitemap.ts`): главная + about + data-sources + 12 city × 2 локали + все routes × 2 локали (≈ 80 записей). `alternates.languages` для hreflang.
- **robots** (`src/app/robots.ts`): allow всё, disallow `/api/`.
- **structured data** (фаза 2, Костя добавит в city/route page-компоненты):
  - `Place` на каждой city-странице,
  - `TouristAttraction` для Алматы/Астаны/Шымкента,
  - `BreadcrumbList` для route.
- **opengraph-image**: глобальный есть от Лёни. Per-city OG в фазе 2 — `app/[locale]/city/[citySlug]/opengraph-image.tsx` через `ImageResponse`.

---

## i18n

- `next-intl 4`, `defineRouting({ locales: ['ru','kk'], defaultLocale: 'ru', localePrefix: 'as-needed' })`.
- Middleware: `src/middleware.ts`, исключает `/api`, `/_next`, статику.
- Локаль читается из URL или `Accept-Language`. Фолбэк — `ru`.
- Словари: `messages/ru.json`, `messages/kk.json`. Неймспейсы: `site`, `nav`, `common`, `home`, `city`, `route`, `about`, `faq`, `footer`, `notFound`.
- KZ-значения новых ключей — `"TODO_KZ:<ru-текст>"`. Grep-able, переводчик отработает позже.
- Названия городов и маршрутов триязычны (`ru` / `kk` / `en`) прямо в `src/content/cities.ts`.

---

## Security-минимум

- **HTTPS-only** — Vercel.
- **CSP** через `next.config.ts` headers() (Лёня настроил, держим мягко до фазы карты, потом затянем `script-src`).
- **HSTS, X-Frame-Options DENY, Referrer-Policy** — есть от Лёни.
- **Rate-limit** на `/api/feed/[citySlug]`: 60 req/min/IP. Upstash REST если есть креды, иначе in-memory.
- **Secrets**: в `.env` (есть `.env.example`), никогда в коде. `NEXT_PUBLIC_*` — только публичные значения.

---

## Открытые вопросы / TODO следующих фаз

1. **OSM relations → геометрия маршрутов**: скрипт `scripts/fetch-osm-routes.ts` через Overpass API, замена сидовых остановок и геометрии. Фаза 2.
2. **GTFS-RT для Алматы**: на момент архитектуры публичного фида нет. Если появится — переключение прозрачно через `BUS_FEED_BASE_URL`.
3. **`app/[locale]/...` структура**: миграция flat `app/page.tsx` → локализованные роуты — Костина задача.
4. **KZ-переводы**: вычистить все `TODO_KZ:` маркеры через `grep -r 'TODO_KZ:' messages/`.
5. **Structured data per route**: схема `BreadcrumbList` + `Place` — Костя в page-компонентах.
6. **Per-city OG-image**: `app/[locale]/city/[citySlug]/opengraph-image.tsx` через `ImageResponse`.
