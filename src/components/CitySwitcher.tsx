"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cities } from "@/lib/cities";
import { cn } from "@/lib/utils";

interface CitySwitcherProps {
  activeSlug?: string | null;
  className?: string;
  /** Куда вести при выборе. Default: `/city/{slug}`. */
  hrefFor?: (slug: string) => string;
}

export function CitySwitcher({
  activeSlug = null,
  className,
  hrefFor,
}: CitySwitcherProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("nav");
  const tCity = useTranslations("city");

  const active = cities.find((c) => c.slug === activeSlug);

  const handleSelect = (slug: string): void => {
    setOpen(false);
    const href = hrefFor ? hrefFor(slug) : `/city/${slug}`;
    router.push(href);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "border-border/70 bg-surface/80 hover:bg-surface-2 h-9 justify-between gap-2 px-3 font-medium",
            className,
          )}
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-[var(--text-muted)]" />
            <span className="truncate">{active ? active.nameRu : t("cities")}</span>
          </span>
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={6}>
        <Command>
          <CommandInput placeholder={tCity("searchPlaceholder")} className="h-10" />
          <CommandList>
            <CommandEmpty>{tCity("searchEmpty")}</CommandEmpty>
            <CommandGroup>
              {cities.map((c) => {
                const isActive = c.slug === activeSlug;
                return (
                  <CommandItem
                    key={c.slug}
                    value={`${c.nameRu} ${c.nameKk} ${c.region}`}
                    onSelect={() => handleSelect(c.slug)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        isActive ? "text-[var(--accent)] opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm leading-tight">{c.nameRu}</span>
                        <span className="text-[10px] leading-tight text-[var(--text-subtle)]">
                          {c.region}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[9px] tracking-wider uppercase",
                          c.hasRealtime ? "text-[var(--live)]" : "text-[var(--text-subtle)]",
                        )}
                      >
                        {c.hasRealtime ? "live" : "soon"}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
