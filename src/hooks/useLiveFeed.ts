"use client";

import { useEffect, useRef, useState } from "react";
import type { CityFeed, FeedError } from "@/types/transit";

export type FeedState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: CityFeed; error: null }
  | {
      status: "error";
      data: CityFeed | null;
      error: FeedError | { error: "network"; message: string };
    };

interface UseLiveFeedOptions {
  /** Polling interval in ms. Default 5000 (5s). */
  intervalMs?: number;
  /** Pause polling (e.g. when tab is hidden or city slug missing). */
  paused?: boolean;
}

/**
 * Polling-хук для `/api/feed/[citySlug]`. Чистый цикл setTimeout с очисткой
 * на unmount/смене slug — не используем setInterval, чтобы не накладывать
 * запросы при медленной сети. Останавливается при `document.hidden`.
 */
export function useLiveFeed(
  citySlug: string | null | undefined,
  options: UseLiveFeedOptions = {},
): FeedState & { refetch: () => void } {
  const { intervalMs = 5_000, paused = false } = options;
  const [state, setState] = useState<FeedState>({ status: "loading", data: null, error: null });
  const aliveRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    aliveRef.current = true;
    if (!citySlug || paused) {
      setState({ status: "loading", data: null, error: null });
      return () => {
        aliveRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    const runFetch = async (): Promise<void> => {
      const currentTick = ++tickRef.current;
      try {
        const res = await fetch(`/api/feed/${citySlug}`, { cache: "no-store" });
        const payload: unknown = await res.json();
        if (!aliveRef.current || tickRef.current !== currentTick) return;

        if (!res.ok) {
          const err =
            typeof payload === "object" && payload !== null && "error" in payload
              ? (payload as FeedError)
              : { error: "upstream_failed" as const, message: `HTTP ${res.status}` };
          setState((prev) => ({
            status: "error",
            data: prev.data,
            error: err,
          }));
          return;
        }

        if (
          typeof payload === "object" &&
          payload !== null &&
          "positions" in payload &&
          Array.isArray((payload as { positions: unknown }).positions)
        ) {
          setState({ status: "ready", data: payload as CityFeed, error: null });
        }
      } catch (err) {
        if (!aliveRef.current) return;
        const message = err instanceof Error ? err.message : "Network error";
        setState((prev) => ({
          status: "error",
          data: prev.data,
          error: { error: "network", message },
        }));
      } finally {
        if (!aliveRef.current) return;
        if (typeof document !== "undefined" && document.hidden) {
          // Пауза при скрытой вкладке — visibilitychange-handler ниже разбудит.
          return;
        }
        timerRef.current = setTimeout(runFetch, intervalMs);
      }
    };

    void runFetch();

    const onVisibility = (): void => {
      if (!document.hidden && timerRef.current == null && aliveRef.current) {
        void runFetch();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      aliveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [citySlug, intervalMs, paused]);

  const refetch = (): void => {
    if (!aliveRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    tickRef.current++;
    setState({ status: "loading", data: null, error: null });
    // Тригерим заново через useEffect-цикл: trick — bump local key
    // через паузу не получится; используем micro-task fetch напрямую.
    void (async () => {
      if (!citySlug) return;
      try {
        const res = await fetch(`/api/feed/${citySlug}`, { cache: "no-store" });
        const payload: unknown = await res.json();
        if (!aliveRef.current) return;
        if (res.ok && typeof payload === "object" && payload !== null && "positions" in payload) {
          setState({ status: "ready", data: payload as CityFeed, error: null });
        } else {
          const err =
            typeof payload === "object" && payload !== null && "error" in payload
              ? (payload as FeedError)
              : { error: "upstream_failed" as const, message: `HTTP ${res.status}` };
          setState({ status: "error", data: null, error: err });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        setState({ status: "error", data: null, error: { error: "network", message } });
      }
    })();
  };

  return { ...state, refetch };
}
