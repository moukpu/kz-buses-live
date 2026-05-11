"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  ru: "Русский",
  kk: "Қазақша",
};

const SHORT: Record<string, string> = {
  ru: "RU",
  kk: "KZ",
};

function swapLocaleInPath(path: string, nextLocale: string): string {
  const segments = path.split("/").filter(Boolean);
  const first = segments[0];
  if (first && (locales as readonly string[]).includes(first)) {
    segments[0] = nextLocale === "ru" ? "" : nextLocale;
  } else if (nextLocale !== "ru") {
    segments.unshift(nextLocale);
  }
  const joined = segments.filter(Boolean).join("/");
  return `/${joined}`;
}

export function LocaleSwitcher(): React.ReactElement {
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const change = (next: string): void => {
    if (next === current) return;
    startTransition(() => {
      router.replace(swapLocaleInPath(pathname, next));
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 font-mono text-xs tracking-wider uppercase"
          disabled={pending}
          aria-label="locale"
        >
          <Languages className="size-3.5" />
          {SHORT[current] ?? current}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end" sideOffset={6}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => change(loc)}
            className={cn(
              "hover:bg-surface-2 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition",
              loc === current && "text-[var(--accent)]",
            )}
          >
            <span>{LABEL[loc] ?? loc}</span>
            <span className="font-mono text-[10px] text-[var(--text-subtle)] uppercase">{loc}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
