"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import type { BillingPlanResponse, SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { SubscribeHero } from "./subscribe-hero";
import { PlanCard } from "./plan-card";
import { PaymentModal } from "../checkout/payment-modal";
import { FreePlanSuccessModal } from "../checkout/free-plan-success-modal";

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

interface BillingPlanViewModel extends BillingPlanResponse {
  description: string;
  features: string[];
  isPopular: boolean;
}

const PLAN_METADATA: Record<
  number,
  Pick<BillingPlanViewModel, "description" | "features" | "isPopular">
> = {
  0: {
    description: "Try the core product experience.",
    features: [
      "Create and manage your organization",
      "Core operational workflows",      
      "Upgrade later when you need automation",
    ],
    isPopular: false,
  },
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

function enrichPlan(plan: BillingPlanResponse): BillingPlanViewModel | null {
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

export function SubscribeView() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState | null>(null);
  const [paymentModalState, setPaymentModalState] = useState<ActivePaymentState | null>(null);
  const [freePlanModalOpen, setFreePlanModalOpen] = useState(false);
  const [plans, setPlans] = useState<BillingPlanViewModel[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setIsLoadingPlans(true);

      try {
        const response = await fetch(`/api/billing/plans?currency=${encodeURIComponent(currency)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load plans");
        }

        const data = (await response.json()) as BillingPlanResponse[];
        if (cancelled) return;

        setPlans(
          data
            .map(enrichPlan)
            .filter((plan): plan is BillingPlanViewModel => plan !== null)
            .sort((left, right) => left.id - right.id),
        );
      } catch (error) {
        if (!cancelled) {
          setFeedbackMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Unable to load the plan catalog.",
            id: Date.now(),
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlans(false);
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const toggleCycle = () => {
    setBillingCycle((prev) => (prev === "MONTHLY" ? "ANNUAL" : "MONTHLY"));
  };

  const handlePlanSuccess = (plan: BillingPlanViewModel, displayPrice: number, data: unknown) => {
    setFeedbackMessage(null);
    const response = data as SubscriptionResponse | undefined;

    if (plan.id === 0 || !response?.clientSecret || !response?.stripePublicKey) {
      if (plan.id === 0) {
        setFreePlanModalOpen(true);
      }
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
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-background px-4 py-12 text-foreground">
      <div className="absolute top-6 left-6 z-20 sm:left-8">
        <Link
          href="/login"
          aria-label="Back to Sign In"
          title="Back to Sign In"
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

      <SubscribeHero
        billingCycle={billingCycle}
        selectedCurrency={currency}
        onCycleToggle={toggleCycle}
        onCurrencyChange={setCurrency}
      />

      <section className="grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingPlans ? (
          <div className="col-span-full flex min-h-[20rem] items-center justify-center rounded-lg border border-border/70 bg-card/70">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              Loading plans...
            </div>
          </div>
        ) : (
          plans.map((plan) => {
            const displayPrice = billingCycle === "ANNUAL" ? plan.annualPriceAmount / 12 : plan.monthlyPriceAmount;

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
                buttonLabel={buildPlanButtonLabel(plan.name)}
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
          })
        )}
      </section>

      <p className="text-xs text-center text-muted-foreground mt-12">
        Cancel anytime Â· Secure billing Â· Plans can be changed later
      </p>

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

      <FreePlanSuccessModal
        isOpen={freePlanModalOpen}
        onClose={() => setFreePlanModalOpen(false)}
        onContinue={() => {
          setFreePlanModalOpen(false);
          router.push("/organizations");
        }}
      />
    </main>
  );
}
