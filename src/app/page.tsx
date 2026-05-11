import { getTranslations } from "next-intl/server";
import { ArrowRight, Github, MapPinned, Radar, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cities } from "@/lib/cities";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tSite = await getTranslations("site");
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="bg-grid absolute inset-x-0 top-0 h-[80dvh]" aria-hidden />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md font-mono text-sm font-bold">
            KZ
          </div>
          <span className="font-mono text-sm tracking-tight">{tSite("name")}</span>
        </div>
        <nav className="text-muted-foreground flex items-center gap-5 text-sm">
          <span className="hover:text-foreground hidden cursor-pointer transition sm:inline">
            {tNav("cities")}
          </span>
          <span className="hover:text-foreground hidden cursor-pointer transition sm:inline">
            {tNav("about")}
          </span>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1.5 transition"
          >
            <Github className="size-4" />
            <span>{tNav("github")}</span>
          </a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <Badge variant="outline" className="border-primary/40 text-primary mb-6">
          {t("eyebrow")}
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-base text-pretty sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button size="lg" className="gap-2">
            {t("ctaPrimary")}
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            {t("ctaSecondary")}
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Radar className="size-5" />}
            title={t("features.realtimeTitle")}
            body={t("features.realtimeBody")}
          />
          <FeatureCard
            icon={<MapPinned className="size-5" />}
            title={t("features.mapTitle")}
            body={t("features.mapBody")}
          />
          <FeatureCard
            icon={<Languages className="size-5" />}
            title={t("features.i18nTitle")}
            body={t("features.i18nBody")}
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <Badge variant="outline" className="mb-4">
          {t("citiesEyebrow")}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("citiesTitle")}</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">{t("citiesSubtitle")}</p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
              <Card className="bg-card/60 hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium tracking-tight">{city.nameRu}</div>
                    <div className="text-muted-foreground text-xs">{city.region}</div>
                  </div>
                  <Badge
                    variant={city.hasRealtime ? "default" : "secondary"}
                    className="font-mono text-[10px] uppercase"
                  >
                    {city.hasRealtime ? t("status.live") : t("status.soon")}
                  </Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-border/60 relative z-10 mx-auto w-full max-w-6xl border-t px-6 py-8">
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>
            © {new Date().getFullYear()} {tSite("name")} · {tFooter("tagline")}
          </span>
          <span className="font-mono">{tFooter("madeWith")}</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="bg-card/60">
      <CardContent className="py-6">
        <div className="text-primary mb-3">{icon}</div>
        <div className="font-medium tracking-tight">{title}</div>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}
