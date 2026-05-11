"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  q: string;
  a: string;
}

export function HomeFAQ(): React.ReactElement {
  const t = useTranslations("faq");
  // next-intl messages JSON: items[] of {q,a}. Используем `t.raw`.
  const items = (t.raw("items") as FAQItem[]) ?? [];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h2 className="font-display mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("title")}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-[var(--text-muted)]">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
