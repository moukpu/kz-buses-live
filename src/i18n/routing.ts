import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "kk"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * next-intl routing config (v4): используется middleware и navigation helpers.
 * `localePrefix: 'as-needed'` → ru без префикса, kk через `/kk/...`.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
