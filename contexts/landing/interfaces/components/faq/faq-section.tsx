"use client";

import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/contexts/shared/interfaces/components/ui/accordion";

export function FaqSection() {
  const { t } = useLandingI18n();
  const faq = t.landing.faq;

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 relative overflow-hidden bg-muted/20 border-t border-border/40"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {faq.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {faq.description}
          </p>
        </div>

        {/* Accordion List */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-xs">
          <Accordion defaultValue={["item-0"]} className="w-full space-y-1">
            {faq.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border/40 pb-2 pt-1 last:border-b-0 last:pb-0"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-2.5 px-2 rounded-lg transition-colors hover:bg-muted/30">
                  <span>{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 pt-1 pb-3">
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
