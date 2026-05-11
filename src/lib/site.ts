export const siteConfig = {
  name: "KZ Buses Live",
  shortName: "KZ Buses",
  description:
    "Маршруты и движение автобусов 12 крупнейших городов Казахстана — на одной карте, с обновлением в реальном времени.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  themeColor: "#0a0a0a",
  accent: "#f59e0b",
  twitter: "@moukpu",
  github: "https://github.com/moukpu/kz-buses-live",
};

export type SiteConfig = typeof siteConfig;
