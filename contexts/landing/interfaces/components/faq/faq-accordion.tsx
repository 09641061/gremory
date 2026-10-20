"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/contexts/shared/interfaces/components/ui/accordion";
import type { LandingFaq } from "@/contexts/landing/interfaces/i18n";

export function FaqAccordion({ items }: { items: LandingFaq["items"] }) {
  // The open state is keyed by index, not by the translated question, so a
  // locale change keeps the same item expanded.
  const [openItems, setOpenItems] = useState<string[]>(["item-0"]);

  return (
    <Accordion
      value={openItems}
      onValueChange={(value) => setOpenItems(value)}
      className="w-full divide-y divide-border/60"
    >
      {items.map((item, index) => {
        const value = `item-${index}`;
        return (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="group/accordion-trigger items-center gap-6 rounded-none px-0 py-5 text-lg font-semibold text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
              <span className="flex-1">{item.question}</span>
              <PlusIcon className="size-5 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden" />
              <MinusIcon className="hidden size-5 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:block" />
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-6 pr-10 text-base leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
