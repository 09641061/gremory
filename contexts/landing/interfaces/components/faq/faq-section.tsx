"use client";

import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/contexts/shared/interfaces/components/ui/accordion";
import { InfoBadge } from "@/contexts/shared/interfaces/components/ui/info-badge";
import { HelpCircleIcon } from "lucide-react";

export function FaqSection() {
  const { t } = useLandingI18n();
  const faq = t.landing.faq;

  return (
    <section
      id="faq"
      className="py-20 lg:py-28 relative overflow-hidden bg-muted/20 border-t border-border/50"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <InfoBadge className="mx-auto uppercase tracking-wider text-[10px]">
            {faq.tag}
          </InfoBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {faq.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {faq.description}
          </p>
        </div>

        {/* Accordion List */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <Accordion defaultValue={["item-0"]} className="w-full space-y-2">
            {faq.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border/60 pb-3 pt-1 last:border-b-0 last:pb-0"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-bold text-foreground hover:no-underline py-3 px-2 rounded-lg transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <HelpCircleIcon className="size-4 text-primary shrink-0" />
                    <span>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed px-9 pt-1 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
