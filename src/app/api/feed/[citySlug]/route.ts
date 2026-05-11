/**
 * GET /api/feed/[citySlug]
 *
 * Edge-runtime, no-cache. Возвращает live-позиции автобусов для города.
 * Если задан BUS_FEED_BASE_URL — проксирует upstream (фьюч GTFS-RT).
 * Иначе считает позиции через детерминированную симуляцию.
 *
 * Rate-limit: 60 req/min/ip, ключ `feed:${citySlug}:${ip}`.
 *
 * Owner: архитектура (Миша).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getCity } from "@/content/cities";
import { simulateCity } from "@/lib/feed/simulate";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import type { CityFeed, FeedError } from "@/types/transit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const upstreamBase = process.env.BUS_FEED_BASE_URL;

function errorResponse(
  status: number,
  body: FeedError,
  extraHeaders: HeadersInit = {},
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

async function tryUpstream(citySlug: string): Promise<CityFeed | null> {
  if (!upstreamBase) return null;
  try {
    const res = await fetch(`${upstreamBase}/feed/${citySlug}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2_000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "positions" in data &&
      Array.isArray((data as { positions: unknown }).positions)
    ) {
      return { ...(data as CityFeed), source: "upstream" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ citySlug: string }> },
): Promise<NextResponse> {
  const { citySlug } = await ctx.params;

  if (!citySlug || typeof citySlug !== "string") {
    return errorResponse(400, {
      error: "bad_request",
      message: "citySlug is required",
    });
  }

  const ip = clientIp(request.headers);
  const rl = await checkRateLimit(`feed:${citySlug}:${ip}`, {
    limit: 60,
    windowSec: 60,
  });
  if (!rl.success) {
    return errorResponse(
      429,
      {
        error: "rate_limited",
        message: `Too many requests. Retry after ${rl.retryAfterSec}s.`,
        retryAfterSec: rl.retryAfterSec,
      },
      { "Retry-After": String(rl.retryAfterSec) },
    );
  }

  const city = getCity(citySlug);
  if (!city) {
    return errorResponse(404, {
      error: "city_not_found",
      message: `Unknown citySlug: ${citySlug}`,
    });
  }

  const upstream = await tryUpstream(citySlug);
  const feed: CityFeed = upstream ?? simulateCity(city);

  return NextResponse.json(feed, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-RateLimit-Source": rl.source,
    },
  });
}
