import Link from "next/link";
import { CheckIcon } from "lucide-react";
import type { LandingPricing } from "@/contexts/landing/interfaces/i18n";

const PLAN_ORDER = ["inicial", "negocio", "multisede"] as const;

type PlanKey = (typeof PLAN_ORDER)[number];

export function PricingSection({ pricing }: { pricing: LandingPricing }) {
  return (
    <section
      id="precios"
      className="scroll-mt-20 border-y border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {pricing.eyebrow}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            {pricing.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLAN_ORDER.map((key: PlanKey) => {
            const plan = pricing.plans[key];
            const isFeatured = key === "negocio";

            return (
              <article
                key={key}
                className={`flex flex-col rounded-2xl bg-card p-6 shadow-xs ${
                  isFeatured
                    ? "border border-primary ring-1 ring-primary/25"
                    : "border border-border/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  {"badge" in plan ? (
                    <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`mt-7 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                    isFeatured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-muted/70"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
