import Link from "next/link";
import { Github } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";

export async function SiteFooter(): Promise<React.ReactElement> {
  const tSite = await getTranslations("site");
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="border-border/50 mt-12 border-t">
      <div className="text-text-muted mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            © {new Date().getFullYear()} {tSite("name")} · {tFooter("tagline")}
          </span>
          <Link href="/about" className="transition-colors hover:text-[var(--text)]">
            {tNav("about")}
          </Link>
          <Link href="/data-sources" className="transition-colors hover:text-[var(--text)]">
            {tNav("dataSources")}
          </Link>
        </div>
        <a
          href={siteConfig.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono transition-colors hover:text-[var(--text)]"
        >
          <Github className="size-3.5" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
