"use client";

import React from "react";
import type { BillingCycle, Currency } from "../../../domain/model/commands/create-subscription.command";
import { CurrencySelector } from "./currency-selector";
import { cn } from "@/lib/utils";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";

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
  const isAnnual = billingCycle === "ANNUAL";

  return (
    <section className="max-w-4xl mx-auto px-4 pt-8 text-center">
      <h1 className="page-title mb-3 text-foreground">
        Choose the plan that fits you
      </h1>
      <p className="page-description mx-auto max-w-2xl">
        Scale your billing infrastructure with Takodu. From single shops to enterprise-level multi-establishment management, we have the right tools for your growth.
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
            Monthly
          </span>

          <Switch checked={isAnnual} onCheckedChange={onCycleToggle} aria-label="Toggle annual billing" />

          <span
            className={cn(
              "text-sm font-semibold flex items-center gap-1.5 transition-colors",
              isAnnual ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            Annual
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold uppercase tracking-wide">
              Save 20%
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
