import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * next-intl middleware: разруливает локаль из URL (`/kk/...`)
 * или из заголовка `Accept-Language`.
 *
 * Матчер исключает API, статику Next, изображения и манифесты —
 * там локаль не нужна, и middleware-overhead был бы лишним.
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
