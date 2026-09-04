"use client";

import React from "react";
import type { BillingCycle, Currency } from "../../../domain/model/commands/create-subscription.command";
import { CurrencySelector } from "./currency-selector";
import { cn } from "@/lib/utils";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { useBillingTranslations } from "@/contexts/billing/interfaces/i18n";

interface SubscribeHeroProps {
  billingCycle: BillingCycle;
  selectedCurrency: Currency;
  onCycleToggle: () => void;
  onCurrencyChange: (currency: Currency) => void;
}

/**
 * SubscribeHero section displaying header title, subtitle, cycle toggle, and currency selector.
 */
export function SubscribeHero({
  billingCycle,
  selectedCurrency,
  onCycleToggle,
  onCurrencyChange,
}: SubscribeHeroProps) {
  const { t } = useBillingTranslations();
  const isAnnual = billingCycle === "ANNUAL";

  return (
    <section className="max-w-4xl mx-auto px-4 pt-8 text-center">
      <h1 className="page-title mb-3 text-foreground">
        {t.subscribe.heroTitle}
      </h1>
      <p className="page-description mx-auto max-w-2xl">
        {t.subscribe.heroDescription}
      </p>

      {/* Control row: Billing Toggle & Currency Selector */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Billing Cycle Toggle */}
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-xs">
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              !isAnnual ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            {t.subscribe.monthly}
          </span>

          <Switch checked={isAnnual} onCheckedChange={onCycleToggle} aria-label="Toggle annual billing" />

          <span
            className={cn(
              "text-sm font-semibold flex items-center gap-1.5 transition-colors",
              isAnnual ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            {t.subscribe.annual}
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold uppercase tracking-wide">
              {t.subscribe.savePercentage}
            </span>
          </span>
        </div>

        {/* Currency Selector */}
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={onCurrencyChange}
        />
      </div>
    </section>
  );
}
