import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dataSources");
  return { title: t("title") };
}

export default async function DataSourcesPage(): Promise<React.ReactElement> {
  const t = await getTranslations("dataSources");

  const sections = [
    { title: t("liveTitle"), body: t("liveBody") },
    { title: t("routesTitle"), body: t("routesBody") },
    { title: t("mapTitle"), body: t("mapBody") },
    { title: t("licenseTitle"), body: t("licenseBody") },
  ];

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-text-muted mt-6">{t("intro")}</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-medium tracking-tight">{s.title}</h2>
              <p className="text-text-muted mt-3">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
