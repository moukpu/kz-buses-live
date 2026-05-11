/**
 * Лёгкий rate-limit для публичных API.
 *
 * Стратегия:
 *  - Если в env заданы UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN —
 *    идём в Upstash через прямой fetch (без зависимости @upstash/ratelimit).
 *  - Иначе — in-memory fixed-window per-process. На Vercel-edge у каждой инстанции
 *    свой Map, что норм для базовой защиты (флапы есть, но spike абсорбится).
 *
 * Edge-runtime safe.
 */

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_SEC = 60;

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface RateLimitResult {
  success: boolean;
  /** Сколько запросов осталось в окне. */
  remaining: number;
  /** Через сколько секунд окно сбросится (для Retry-After header). */
  retryAfterSec: number;
  /** Откуда пришёл ответ: redis (upstash) или память. */
  source: "upstash" | "memory";
}

interface MemoryEntry {
  count: number;
  resetAt: number; // unix ms
}

const memoryStore = new Map<string, MemoryEntry>();

function checkMemory(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return {
      success: true,
      remaining: limit - 1,
      retryAfterSec: windowSec,
      source: "memory",
    };
  }
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
      source: "memory",
    };
  }
  entry.count += 1;
  return {
    success: true,
    remaining: limit - entry.count,
    retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    source: "memory",
  };
}

/**
 * Upstash REST: INCR + EXPIRE через pipeline.
 * https://upstash.com/docs/redis/features/restapi
 */
async function checkUpstash(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!upstashUrl || !upstashToken) {
    return checkMemory(key, limit, windowSec);
  }
  try {
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
    });
    if (!res.ok) {
      return checkMemory(key, limit, windowSec);
    }
    const json: ReadonlyArray<{ result: number }> = await res.json();
    const incrResult = json[0]?.result ?? 0;
    const ttlResult = json[2]?.result ?? windowSec;
    const remaining = Math.max(0, limit - incrResult);
    return {
      success: incrResult <= limit,
      remaining,
      retryAfterSec: ttlResult > 0 ? ttlResult : windowSec,
      source: "upstash",
    };
  } catch {
    return checkMemory(key, limit, windowSec);
  }
}

export interface RateLimitOptions {
  /** Максимум запросов в окно. */
  limit?: number;
  /** Длина окна в секундах. */
  windowSec?: number;
}

/**
 * Проверить лимит для ключа (обычно `${endpoint}:${ip}`).
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const limit = opts.limit ?? DEFAULT_LIMIT;
  const windowSec = opts.windowSec ?? DEFAULT_WINDOW_SEC;

  if (upstashUrl && upstashToken) {
    return checkUpstash(key, limit, windowSec);
  }
  return checkMemory(key, limit, windowSec);
}

/**
 * Извлечь client IP из заголовков (x-forwarded-for на Vercel, x-real-ip).
 * Возвращает "anon" если ничего не нашлось.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "anon";
}
