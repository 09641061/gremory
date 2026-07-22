"use client";

import React from "react";
import type { BillingCycle, Currency } from "../../../domain/model/commands/create-subscription.command";
import { CurrencySelector } from "./currency-selector";
import { cn } from "@/lib/utils";

interface PlansHeroProps {
  billingCycle: BillingCycle;
  selectedCurrency: Currency;
  onCycleToggle: () => void;
  onCurrencyChange: (currency: Currency) => void;
}

/**
 * PlansHero section displaying the header title, annual/monthly toggle, and currency selector.
 */
export function PlansHero({
  billingCycle,
  selectedCurrency,
  onCycleToggle,
  onCurrencyChange,
}: PlansHeroProps) {
  const isAnnual = billingCycle === "ANNUAL";

  return (
    <section className="max-w-4xl mx-auto px-4 pt-12 md:pt-16 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
        Choose your plan
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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

          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            onClick={onCycleToggle}
            aria-label="Toggle annual billing"
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ring-2 ring-primary/20",
              isAnnual ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                isAnnual ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>

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
