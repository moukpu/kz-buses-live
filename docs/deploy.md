# Deploy — Vercel

Этот документ — single source of truth по тому, как `kz-buses-live` попадает
на Vercel. Команда AI не имеет рабочего `VERCEL_TOKEN`, поэтому **первичный
импорт делает оператор вручную** (30 секунд). После этого Vercel автоматом
ловит каждый push: preview на PR, prod на `main`.

## 1. Первичный импорт (один раз, ~30 сек)

1. Открыть [vercel.com/new](https://vercel.com/new) → **Add New… → Project**.
2. В блоке **Import Git Repository** выбрать `moukpu/kz-buses-live`. Если
   репо не виден — **Adjust GitHub App Permissions** → дать доступ к нему.
3. На странице **Configure Project** оставить дефолты Vercel — они уже
   совпадают с нужными:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build & Output Settings → Build Command:** `pnpm build`
   - **Install Command:** `pnpm install --frozen-lockfile`
   - **Node.js Version:** `20.x` (Settings → General → Node.js Version)
4. **Environment Variables** — добавить четыре переменные (значения подсыпает
   оператор, см. таблицу ниже). Поставить scope `Production`, `Preview` и
   `Development` для всех четырёх.
5. **Deploy.** Через ~60 секунд получаем prod-URL вида
   `https://kz-buses-live.vercel.app`.

## 2. Environment variables

| Переменная                  | Где            | Что класть                                                                                                       |
| --------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | client+server  | Канонический prod-URL, например `https://kz-buses-live.vercel.app` или будущий кастомный домен.                  |
| `NEXT_PUBLIC_MAPTILER_KEY`  | client         | API key из [cloud.maptiler.com](https://cloud.maptiler.com) → **API keys**. Без него фронт встанет на fallback. |
| `UPSTASH_REDIS_REST_URL`    | server         | REST endpoint из [console.upstash.com](https://console.upstash.com) → Redis DB → **REST API → UPSTASH_REDIS_REST_URL**. |
| `UPSTASH_REDIS_REST_TOKEN`  | server         | Парный токен оттуда же (`UPSTASH_REDIS_REST_TOKEN`). URL+токен — пара, либо обе, либо ни одной.                  |

Чек: после деплоя `https://<prod-url>/sitemap.xml` отдаёт корректный
`https://<prod-url>` в `<loc>` — значит `NEXT_PUBLIC_SITE_URL` подцепился.

## 3. Build settings (canonical reference)

| Поле                        | Значение                            |
| --------------------------- | ----------------------------------- |
| Framework Preset            | Next.js                              |
| Install Command             | `pnpm install --frozen-lockfile`     |
| Build Command               | `pnpm build`                         |
| Output Directory            | `.next` (Next.js default)            |
| Node.js Version             | 20.x                                 |
| Production Branch           | `main`                               |
| Preview Branches            | All other branches (по умолчанию)    |

Vercel определяет `pnpm` из `packageManager` в `package.json` (`pnpm@9.15.1`),
дополнительной настройки не требуется.

## 4. После импорта — что происходит автоматически

- Каждый push в `main` → prod-deploy, URL `https://kz-buses-live.vercel.app`.
- Каждый push в любую другую ветку с PR → preview-deploy, бот Vercel
  оставляет ссылку комментом в PR (`Visit Preview`).
- Logs / metrics — Vercel dashboard → Project → Deployments / Observability.
- Instant rollback — Deployments → выбрать предыдущий → **Promote to Production**.

## 5. Альтернативный путь — CLI с рабочим токеном

Если оператор хочет полностью автоматизировать (например, из CI или из Devin),
ротировать токен через [vercel.com/account/tokens](https://vercel.com/account/tokens)
→ **Create Token** (Scope: full account или конкретная team), потом положить
в Devin org secrets как `VERCEL_TOKEN`. После этого деплой одной командой:

```bash
pnpm dlx vercel pull   --yes --environment=production --token=$VERCEL_TOKEN
pnpm dlx vercel build  --prod                          --token=$VERCEL_TOKEN
pnpm dlx vercel deploy --prebuilt --prod               --token=$VERCEL_TOKEN
```

На момент создания этого документа сохранённый в среде `VERCEL_TOKEN`
отвергался API (`The token provided … is not valid`), поэтому используется
ручной импорт из §1.

## 6. Branch protection (для контекста)

`main` уже защищён: PR обязателен, 0 required reviewers (AI-команда сама
мерджит), required check `ci` (`pnpm install --frozen-lockfile → lint →
typecheck → build`, Node 22 в CI; Node 20.x в Vercel runtime — оба
поддерживаются `next@15.5`).

## 7. Что делать если деплой упал

1. Vercel → Project → Deployments → выбрать упавший → **View Logs** →
   найти первую ошибку (обычно `pnpm install` либо `pnpm build`).
2. Если виноваты env vars — Settings → Environment Variables → **Redeploy**.
3. Если виноват код — `git revert <bad-sha>` в `main` (или **Promote to
   Production** на предыдущий зелёный deploy).
4. Постмортем — короткий issue в репо: что сломалось, как починили, что
   сделать чтобы не повторилось.
