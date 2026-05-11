/**
 * kz-buses-live · Typography
 * --------------------------------------------------------------------------
 * Three voices, deliberate roles:
 *   - Unbounded (display)  — большие заголовки, hero, цифры в hero-метриках.
 *                            Geometric, тёплый character.
 *   - Inter (body / UI)    — весь интерфейс: списки, карточки, кнопки,
 *                            подписи. Огромное покрытие кириллицы.
 *   - JetBrains Mono       — табличные цифры: ETA-минуты, номера маршрутов,
 *                            координаты, время. Tabular figures by default.
 *
 * All three include `cyrillic` + `cyrillic-ext`, which between them cover
 * the Kazakh-specific letters ң ғ ү ұ қ ө һ і. Subsets are kept minimal
 * (latin + latin-ext + cyrillic + cyrillic-ext) — `cyrillic-ext` is the
 * subset that carries ң/ғ/ұ/қ/ө/һ/і glyphs on Google Fonts. Removing it
 * silently breaks Kazakh rendering, so leave it in.
 *
 * Wiring (для Кости): импорт в `src/app/layout.tsx`, навесить классы на
 * `<body>`:
 *
 *   import { fontDisplay, fontBody, fontMono } from "@/styles/fonts";
 *   …
 *   <body className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased`}>
 *
 * После этого CSS-переменные `--font-display` / `--font-body` / `--font-mono`
 * из `tokens.css` подхватят правильные Next-font значения автоматически.
 */
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";

const FONT_SUBSETS = ["latin", "latin-ext", "cyrillic", "cyrillic-ext"] as const;

export const fontDisplay = Unbounded({
  variable: "--font-unbounded",
  subsets: [...FONT_SUBSETS],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const fontBody = Inter({
  variable: "--font-inter",
  subsets: [...FONT_SUBSETS],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: [...FONT_SUBSETS],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * Type guard for `<html lang>` — covers both supported locales.
 * Kept here so layout / providers can import a single source of truth.
 */
export const supportedLocales = ["ru", "kk"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
