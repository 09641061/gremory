import type { LandingHowItWorks } from "@/contexts/landing/interfaces/i18n";

export function HowItWorksSection({
  howItWorks,
}: {
  howItWorks: LandingHowItWorks;
}) {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-20 border-y border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {howItWorks.eyebrow}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            {howItWorks.title}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs"
            >
              <p className="text-4xl font-extrabold leading-none text-primary">
                {index + 1}
              </p>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
