import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * next-intl 4.x: читаем локаль из `requestLocale`, фолбэк на defaultLocale.
 * Словари грузим динамически — Next-bundler разрежет их на чанки.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "Asia/Almaty",
    now: new Date(),
  };
});
