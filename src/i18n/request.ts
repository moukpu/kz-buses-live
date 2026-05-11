import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./routing";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "Asia/Almaty",
    now: new Date(),
  };
});
