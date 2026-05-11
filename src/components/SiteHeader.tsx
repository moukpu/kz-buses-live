import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Github } from "lucide-react";
import { CitySwitcher } from "@/components/CitySwitcher";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { siteConfig } from "@/lib/site";

interface SiteHeaderProps {
  activeSlug?: string | null;
  /** Прижатый sticky-вариант (тонкая полоска поверх карты на city/route). */
  variant?: "default" | "compact";
}

export async function SiteHeader({
  activeSlug = null,
  variant = "default",
}: SiteHeaderProps): Promise<React.ReactElement> {
  const tSite = await getTranslations("site");
  const tNav = await getTranslations("nav");

  const compact = variant === "compact";

  return (
    <header
      className="border-border/50 bg-bg/85 sticky top-0 z-[var(--z-header)] w-full border-b backdrop-blur-md"
      style={{ height: "var(--header-h)" }}
    >
      <div
        className={
          compact
            ? "mx-auto flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6"
            : "mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        }
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-[var(--accent)] font-mono text-sm font-bold text-[var(--accent-fg)] transition-transform group-hover:scale-105">
            KZ
          </div>
          <span className="font-display hidden text-sm tracking-tight sm:inline">
            {tSite("name")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <CitySwitcher activeSlug={activeSlug} />
          <LocaleSwitcher />
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hidden text-[var(--text-muted)] sm:inline-flex"
            aria-label={tNav("github")}
          >
            <Github className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
