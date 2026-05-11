import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title") };
}

export default async function AboutPage(): Promise<React.ReactElement> {
  const t = await getTranslations("about");

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-text-muted mt-6 text-lg">{t("intro")}</p>
        <p className="text-text-muted mt-4">{t("mission")}</p>

        <section className="mt-12">
          <h2 className="font-display text-xl font-medium tracking-tight">{t("stackTitle")}</h2>
          <p className="text-text-muted mt-3 font-mono text-sm">{t("stack")}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-medium tracking-tight">{t("teamTitle")}</h2>
          <p className="text-text-muted mt-3">{t("team")}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
