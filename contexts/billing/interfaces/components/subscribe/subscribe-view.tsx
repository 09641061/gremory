"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
// Type-only: erased at compile time, so the server-only module is never bundled.
import type {
  PlanReadModel,
  PlansByCurrencyReadModel,
} from "../../../application/internal/queryservices/list-plans-query.service";
import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { SubscribeHero } from "./subscribe-hero";
import { PlanCard } from "./plan-card";
import { PaymentModal } from "../checkout/payment-modal";


interface ActivePaymentState {
  clientSecret: string | null | undefined;
  stripePublicKey: string | null | undefined;
  planName: string;
  amountFormatted: string;
}

interface FeedbackState {
  type: "success" | "error";
  text: string;
  id: number;
}

type BillingPlanMetadata = {
  description: string;
  features: string[];
  isPopular: boolean;
};

type BillingPlanViewModel = PlanReadModel & BillingPlanMetadata;

/**
 * Paid plans only. Membership here is what puts a plan on the page: the
 * catalog endpoint still returns the free plan, and `enrichPlan` drops
 * anything without metadata.
 */
const PLAN_METADATA: Record<number, BillingPlanMetadata> = {
  1: {
    description: "Perfect for startups and local shops.",
    features: [
      "1 establishment included",
      "Core billing tools",
      "Standard API access",
      "Email support",
    ],
    isPopular: false,
  },
  2: {
    description: "For growing enterprises with complex needs.",
    features: [
      "Unlimited establishments",
      "Advanced analytics dashboard",
      "Custom domain integration",
      "24/7 Priority support",
      "Bulk invoice management",
    ],
    isPopular: true,
  },
};

function enrichPlan(plan: PlanReadModel): BillingPlanViewModel | null {
  const metadata = PLAN_METADATA[plan.id];
  if (!metadata) return null;

  return {
    ...plan,
    ...metadata,
  };
}

function buildPlanButtonLabel(planName: string): string {
  return `Get ${planName} plan`;
}

interface SubscribeViewProps {
  /** Where the back arrow returns to. The page resolves it from the plan. */
  backHref: string;
  /** Every supported currency, priced server-side, so switching costs nothing. */
  plansByCurrency: PlansByCurrencyReadModel;
  currentSubscription?: SubscriptionAccessSnapshot | null;
}

export function SubscribeView({ backHref, plansByCurrency, currentSubscription }: SubscribeViewProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState | null>(null);
  const [paymentModalState, setPaymentModalState] = useState<ActivePaymentState | null>(null);
  const plans = useMemo(
    () =>
      (plansByCurrency[currency] ?? [])
        .map(enrichPlan)
        .filter((plan): plan is BillingPlanViewModel => plan !== null)
        .sort((left, right) => left.id - right.id),
    [plansByCurrency, currency]
  );

  const toggleCycle = () => {
    setBillingCycle((prev) => (prev === "MONTHLY" ? "ANNUAL" : "MONTHLY"));
  };

  const handlePlanSuccess = (plan: BillingPlanViewModel, displayPrice: number, data: unknown) => {
    setFeedbackMessage(null);
    const response = data as { clientSecret?: string | null; stripePublicKey?: string | null } | undefined;

    if (!response?.clientSecret || !response?.stripePublicKey) {
      return;
    }

    const symbol = getCurrencySymbol(currency);
    const amountFormatted = `${symbol} ${displayPrice.toFixed(2)} ${currency}`;

    setPaymentModalState({
      clientSecret: response.clientSecret,
      stripePublicKey: response.stripePublicKey,
      planName: plan.name,
      amountFormatted,
    });
  };

  return (
    <main className="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-10 overflow-hidden bg-background px-4 py-12 text-foreground">
      <div className="absolute top-6 left-6 z-20 sm:left-8">
        <Link
          href={backHref}
          aria-label="Back"
          title="Back"
          className="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {feedbackMessage ? (
        <ErrorAlert
          key={feedbackMessage.id}
          title={feedbackMessage.type === "error" ? "Sign-in Required" : "Notification"}
          message={feedbackMessage.text}
        />
      ) : null}

      <div className="w-full max-w-4xl space-y-6">
        <SubscribeHero
          billingCycle={billingCycle}
          selectedCurrency={currency}
          onCycleToggle={toggleCycle}
          onCurrencyChange={setCurrency}
        />

        <section className="grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          {plans.map((plan) => {
            const displayPrice =
              billingCycle === "ANNUAL" ? plan.annualPriceAmount / 12 : plan.monthlyPriceAmount;

            const isCurrent =
              currentSubscription?.active &&
              currentSubscription.planId === plan.id &&
              currentSubscription.billingCycle === billingCycle;

            return (
              <PlanCard
                key={plan.id}
                planId={plan.id}
                name={plan.name}
                description={plan.description}
                monthlyPrice={plan.monthlyPriceAmount}
                annualPricePerMonth={plan.annualPriceAmount / 12}
                currency={currency}
                billingCycle={billingCycle}
                features={[...plan.features]}
                isPopular={plan.isPopular}
                buttonLabel={isCurrent ? "Current plan" : buildPlanButtonLabel(plan.name)}
                buttonDisabled={isCurrent}
                onSuccess={(data) => handlePlanSuccess(plan, displayPrice, data)}
                onError={(err) =>
                  setFeedbackMessage({
                    type: "error",
                    text: err || "You must be signed in to select a subscription plan.",
                    id: Date.now(),
                  })
                }
              />
            );
          })}
        </section>
      </div>

      <div className="flex flex-col items-center gap-2 mt-12">
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. Secure billing. Plans can be changed later.
        </p>
      </div>

      {paymentModalState ? (
        <PaymentModal
          key={paymentModalState.clientSecret ?? paymentModalState.planName}
          isOpen={Boolean(paymentModalState)}
          onClose={() => setPaymentModalState(null)}
          clientSecret={paymentModalState.clientSecret}
          stripePublicKey={paymentModalState.stripePublicKey}
          planName={paymentModalState.planName}
          amountFormatted={paymentModalState.amountFormatted}
        />
      ) : null}
    </main>
  );
}
