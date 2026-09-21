"use client";

import { useState } from "react";
import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  CheckIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";

export function PricingSection() {
  const { t } = useLandingI18n();
  const pricing = t.landing.pricing;

  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "PEN">("USD");

  const plans = [
    {
      id: "standard",
      name: pricing.standard.name,
      description: pricing.standard.description,
      price: isYearly
        ? currency === "USD"
          ? pricing.standard.priceYearlyUSD
          : pricing.standard.priceYearlyPEN
        : currency === "USD"
          ? pricing.standard.priceMonthlyUSD
          : pricing.standard.priceMonthlyPEN,
      period: pricing.standard.period,
      billedNote: isYearly
        ? currency === "USD"
          ? pricing.standard.billedAnnuallyUSD
          : pricing.standard.billedAnnuallyPEN
        : null,
      features: pricing.standard.features,
      cta: pricing.standard.cta,
      ctaHref: "/login",
      popular: false,
      buttonVariant: "outline" as const,
    },
    {
      id: "max",
      name: pricing.max.name,
      description: pricing.max.description,
      price: isYearly
        ? currency === "USD"
          ? pricing.max.priceYearlyUSD
          : pricing.max.priceYearlyPEN
        : currency === "USD"
          ? pricing.max.priceMonthlyUSD
          : pricing.max.priceMonthlyPEN,
      period: pricing.max.period,
      billedNote: isYearly
        ? currency === "USD"
          ? pricing.max.billedAnnuallyUSD
          : pricing.max.billedAnnuallyPEN
        : null,
      features: pricing.max.features,
      cta: pricing.max.cta,
      ctaHref: "/login?next=/upgrade",
      popular: true,
      buttonVariant: "default" as const,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-16 lg:py-24 relative overflow-hidden bg-muted/20 border-y border-border/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {pricing.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {pricing.description}
          </p>
        </div>

        {/* Toggles (Billing Cycle + Currency) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center gap-3 bg-card border border-border/60 px-3.5 py-1.5 rounded-full shadow-xs">
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                !isYearly ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {pricing.monthly}
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Toggle annual billing"
            />
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                isYearly ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {pricing.yearly}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              {pricing.saveBadge}
            </span>
          </div>

          {/* Currency Toggle (USD / PEN) */}
          <div className="flex items-center rounded-full border border-border/60 bg-card p-0.5 text-xs font-medium shadow-xs">
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-full px-3 py-1 transition-all ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("PEN")}
              className={`rounded-full px-3 py-1 transition-all ${
                currency === "PEN"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PEN (S/.)
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between overflow-hidden transition-all duration-200 rounded-2xl bg-card ${
                plan.popular
                  ? "border-2 border-primary/80 shadow-md"
                  : "border border-border/60 shadow-xs hover:border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <SparklesIcon className="size-3" />
                    {pricing.popularBadge}
                  </div>
                </div>
              )}

              <CardHeader className="space-y-2.5 pt-7 pb-5 px-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {plan.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </CardDescription>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                    {plan.period}
                  </span>
                </div>

                {plan.billedNote && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {plan.billedNote}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4 flex-1 px-6 sm:px-8">
                <div className="pt-3 border-t border-border/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Incluye:
                  </p>
                  <ul className="space-y-2.5 text-sm text-foreground">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                          <CheckIcon className="size-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm leading-snug text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-4 pb-7 px-6 sm:px-8 bg-transparent">
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  nativeButton={false}
                  className={`w-full justify-center gap-2 h-11 text-xs sm:text-sm font-semibold shadow-xs ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border/80 text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href={plan.ctaHref} />}
                >
                  <span>{plan.cta}</span>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
