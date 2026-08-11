"use client";

import React, { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { createSubscriptionAction } from "../../actions/create-subscription.action";
import { FreeIcon } from "../icons/free";
import { StandardIcon } from "../icons/standart";
import { PremiumIcon } from "../icons/premium";
import { cn } from "@/lib/utils";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";

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
  buttonDisabled?: boolean;
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
  buttonLabel,
  buttonDisabled = false,
  onSuccess,
  onError,
}: PlanCardProps) {
  const [isPending, startTransition] = useTransition();

  const isAnnual = billingCycle === "ANNUAL";
  const displayPrice = isAnnual ? annualPricePerMonth : monthlyPrice;
  const currencySymbol = getCurrencySymbol(currency);

  const defaultButtonText =
    buttonLabel ??
    (planId === 0 ? "Get Free plan" : planId === 2 ? "Get Premium plan" : "Get Standart plan");

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
    <Card
      className={cn(
        "relative h-full rounded-lg p-7 transition-all duration-300 justify-between border-border shadow-sm hover:shadow-md"
      )}
    >
      <div>
        {/* Custom Plan SVG Icon */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center text-foreground">
          {planId === 0 ? (
            <FreeIcon className="text-foreground" />
          ) : planId === 2 ? (
            <PremiumIcon className="text-foreground" />
          ) : (
            <StandardIcon className="text-foreground" />
          )}
        </div>

        {/* Plan Title & Short Description */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">{name}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {currencySymbol}{displayPrice.toFixed(0)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
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
        <Button
          type="button"
          disabled={isPending || buttonDisabled}
          onClick={handleSelectPlan}
          variant="outline"
          size="lg"
          className={cn(
            "w-full rounded-md border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-150 active:scale-[0.99] shadow-xs",
            buttonDisabled && "opacity-50 cursor-not-allowed hover:bg-background text-muted-foreground"
          )}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span>{defaultButtonText}</span>
          )}
        </Button>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Features Header */}
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Includes
          </span>
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
              <Check className="size-4 text-foreground/80 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
