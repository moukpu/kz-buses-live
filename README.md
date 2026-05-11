# KZ Buses Live

> Премиум-сайт реального времени с маршрутами и отслеживанием автобусов по
> крупным городам Казахстана. Тон: Apple Maps × Citymapper × Яндекс.Транспорт.

[![CI](https://github.com/moukpu/kz-buses-live/actions/workflows/ci.yml/badge.svg)](https://github.com/moukpu/kz-buses-live/actions/workflows/ci.yml)

## Стек

- **Next.js 15** (App Router, RSC) + **TypeScript** (strict)
- **Tailwind v4** + **shadcn/ui** (new-york, zinc base, премиум-тёмная тема)
- **Framer Motion** для микро-анимаций
- **MapLibre GL JS** — карты, тёмный стиль, векторные тайлы
- **next-intl** — RU primary, KZ словари заведены (placeholder)
- **pnpm** (≥ 9), ESLint, Prettier (+ tailwindcss plugin)
- Хостинг: **Vercel** (preview на каждый PR, prod на `main`)

## Города в первой фазе (12)

Алматы · Астана · Шымкент · Караганда · Актобе · Тараз · Павлодар ·
Усть-Каменогорск (Өскемен) · Семей · Атырау · Костанай · Кызылорда.

См. <code>src/lib/cities.ts</code> — каждый город имеет `slug`, координаты
центра и флаг `hasRealtime` (включается, когда подключён GTFS-RT-источник).

## Запуск локально

```bash
pnpm install
cp .env.example .env.local   # опциональные переменные
pnpm dev                     # → http://localhost:3000
```

Полезные команды:

```bash
pnpm lint        # ESLint + next/core-web-vitals
pnpm typecheck   # tsc --noEmit
pnpm build       # production build
pnpm format      # prettier --write .
```

## Переменные окружения

| Переменная                  | Где           | Обязательная | Зачем                                                                        |
| --------------------------- | ------------- | ------------ | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | client+server | желательно   | Канонический URL для `metadataBase`, sitemap, OG-тегов.                      |
| `NEXT_PUBLIC_MAPTILER_KEY`  | client        | нет          | MapTiler basemap (премиум-тайлы); без неё — fallback.                        |
| `UPSTASH_REDIS_REST_URL`    | server        | для prod     | Upstash Redis REST endpoint для `@upstash/ratelimit` (rate-limit на API).    |
| `UPSTASH_REDIS_REST_TOKEN`  | server        | для prod     | Парный токен к `UPSTASH_REDIS_REST_URL`. Без пары — rate-limit no-op в dev.  |
| `BUS_FEED_BASE_URL`         | server        | нет          | Upstream GTFS-RT / mock-feed; без неё — симулятор.                           |

Шаблон — в `.env.example`. В Vercel переменные задаются через дашборд
**Settings → Environment Variables** для Production и Preview раздельно.
Значения подсыпает владелец проекта (Upstash → создать Redis DB → REST →
скопировать URL + Token; MapTiler → дашборд → API keys).

## Структура

```
src/
  app/
    layout.tsx              # root layout — html lang, NextIntlClientProvider, dark by default
    page.tsx                # лендинг (hero + features + 12 cities)
    not-found.tsx           # локализованный 404
    icon.tsx                # динамический favicon (next/og)
    apple-icon.tsx          # 180×180 apple-touch-icon
    opengraph-image.tsx     # 1200×630 OG-картинка, edge runtime
    robots.ts               # robots.txt
    sitemap.ts              # sitemap.xml
    manifest.ts             # PWA manifest (theme-color)
    globals.css             # Tailwind v4 + shadcn tokens + dark vars
  components/
    ui/                     # shadcn: button, card, sheet, dialog, badge,
                            # skeleton, tooltip, command, scroll-area
  i18n/
    routing.ts              # locales = ru, kk; defaultLocale = ru
    request.ts              # next-intl request config
  lib/
    cities.ts               # 12 городов с координатами
    site.ts                 # siteConfig (name, url, theme color, github)
    utils.ts                # cn() helper
messages/
  ru.json                   # русские строки
  kk.json                   # казахские строки (placeholder)
.github/workflows/ci.yml    # pnpm install → lint → typecheck → build
```

## Деплой

Подключён к Vercel (`moukpu`-аккаунт). На каждый PR — preview-URL в комментарии
бота. Merge в `main` → prod-deploy. `next.config.ts` отключает
`x-powered-by` и включает оптимизацию импорта `lucide-react` / `framer-motion`.

## Branch protection

`main` защищён: PR обязателен, прямой push запрещён. Required reviewers
**не включены** (чтобы автор сам мерджил). CI должен пройти (`ci`).

## Roadmap (phase 2+)

- [ ] `/[city]` маршрутные страницы (Алматы первым)
- [ ] Live-карта (`MapLibre` + WebSocket / SSE поток)
- [ ] Подключение GTFS-RT для Алматы и Астаны
- [ ] Серверный симулятор для остальных 10 городов
- [ ] KZ-перевод (next-intl уже готов)
- [ ] PWA install + offline-fallback карты