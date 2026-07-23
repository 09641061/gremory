"use client";

import React, { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { createSubscriptionAction } from "../../actions/create-subscription.action";
import { StandardIcon } from "../icons/standart";
import { PremiumIcon } from "../icons/premium";
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
 * PlanCard component matching the design layout of the plan selection interface using StandardIcon & PremiumIcon.
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

  const defaultButtonText =
    buttonLabel ?? (planId === 2 ? "Get Premium plan" : "Get Standart plan");

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
        "relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between bg-card border border-border shadow-sm hover:shadow-md",
        isPopular && "ring-2 ring-primary/20 border-primary/50"
      )}
    >
      <div>
        {/* Custom Plan SVG Icon */}
        <div className="mb-4">
          {planId === 2 ? (
            <PremiumIcon className="w-10 h-auto text-foreground" />
          ) : (
            <StandardIcon className="w-10 h-auto text-foreground" />
          )}
        </div>

        {/* Plan Title & Short Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{name}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {currencySymbol}{displayPrice.toFixed(0)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {currency} / month
            </span>
          </div>
          {isAnnual && (
            <p className="text-xs text-primary font-semibold mt-1">
              Billed annually ({currencySymbol}{(displayPrice * 12).toFixed(0)} {currency}/yr)
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isPending}
          onClick={handleSelectPlan}
          className="w-full py-3 px-6 rounded-xl border border-foreground/30 hover:border-foreground bg-background text-foreground hover:bg-muted font-semibold text-sm transition-all duration-150 active:scale-[0.99] disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span>{defaultButtonText}</span>
          )}
        </button>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Features Header */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {planId === 2 ? "EVERYTHING IN FERVIENTE" : "INCLUDES"}
          </span>
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
              {planId === 2 ? (
                <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3.5 stroke-[3]" />
                </div>
              ) : (
                <Check className="size-4 text-foreground/80 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
