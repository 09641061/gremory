"use client";

import React, { useTransition } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { createSubscriptionAction } from "../../actions/create-subscription.action";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  planId: number;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  currency: CurrencyCode;
  billingCycle: BillingCycleType;
  features: string[];
  isPopular?: boolean;
  buttonLabel?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

/**
 * PlanCard component rendering plan details, pricing per currency/cycle, and handling server action submission.
 */
export function PlanCard({
  planId,
  name,
  description,
  monthlyPrice,
  annualPricePerMonth,
  currency,
  billingCycle,
  features,
  isPopular = false,
  buttonLabel,
  onSuccess,
  onError,
}: PlanCardProps) {
  const [isPending, startTransition] = useTransition();

  const isAnnual = billingCycle === "ANNUAL";
  const displayPrice = isAnnual ? annualPricePerMonth : monthlyPrice;
  const currencySymbol = getCurrencySymbol(currency);

  const handleSelectPlan = () => {
    startTransition(async () => {
      const result = await createSubscriptionAction({
        planId,
        billingCycle,
        currency,
      });

      if (result.status === "success") {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error);
      }
    });
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between bg-card border",
        isPopular
          ? "border-2 border-primary shadow-xl ring-1 ring-primary/20 scale-102"
          : "border-border shadow-xs hover:border-primary/50"
      )}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 right-8 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold shadow-md">
          Most Popular
        </div>
      )}

      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-foreground tracking-tight">
              {currencySymbol} {displayPrice.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {currency} / mo
            </span>
          </div>
          {isAnnual && (
            <p className="text-xs text-primary font-semibold mt-1">
              Billed annually ({currencySymbol} {(displayPrice * 12).toFixed(2)} {currency}/yr)
            </p>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle2 className="size-5 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSelectPlan}
        className={cn(
          "w-full py-3.5 px-6 font-semibold text-sm rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-2",
          isPopular
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            : "bg-secondary/15 text-foreground hover:bg-secondary/25"
        )}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <span>{buttonLabel ?? `Start with ${name}`}</span>
            {isPopular && <ArrowRight className="size-4" />}
          </>
        )}
      </button>
    </div>
  );
}
