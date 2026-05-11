import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <div className="bg-grid absolute inset-x-0 top-0 h-[60dvh]" aria-hidden />
      <div className="relative z-10 mx-auto max-w-md text-center">
        <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">{t("title")}</h1>
        <p className="text-muted-foreground mt-4 text-pretty">{t("subtitle")}</p>
        <Button asChild className="mt-8">
          <Link href="/">{t("cta")}</Link>
        </Button>
      </div>
    </main>
  );
}
