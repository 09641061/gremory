import type { LandingFaq } from "@/contexts/landing/interfaces/i18n";
import { FaqAccordion } from "./faq-accordion";

export function FaqSection({ faq }: { faq: LandingFaq }) {
  return (
    <section id="preguntas" className="scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
        <div className="max-w-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {faq.eyebrow}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            {faq.title}
          </h2>
        </div>

        <FaqAccordion items={faq.items} />
      </div>
    </section>
  );
}
