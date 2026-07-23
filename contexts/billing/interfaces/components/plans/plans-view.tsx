"use client";

import React, { useState, useMemo } from "react";
import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { ListPlansQueryService } from "../../../application/internal/queryservices/list-plans-query.service";
import type { SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { PlansHero } from "./plans-hero";
import { PlanCard } from "./plan-card";
import { StripePaymentModal } from "./stripe-payment-modal";

interface ActivePaymentState {
  clientSecret: string | null | undefined;
  stripePublicKey: string | null | undefined;
  planName: string;
  amountFormatted: string;
}

/**
 * PlansView component rendering the standalone plan selection interface.
 */
export function PlansView() {
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");
  const [currency, setCurrency] = useState<CurrencyCode>("PEN");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [paymentModalState, setPaymentModalState] = useState<ActivePaymentState | null>(null);

  const toggleCycle = () => {
    setBillingCycle((prev) => (prev === "MONTHLY" ? "ANNUAL" : "MONTHLY"));
  };

  const queryService = useMemo(() => new ListPlansQueryService(), []);
  const plans = useMemo(
    () => queryService.getAvailablePlans(currency, billingCycle),
    [queryService, currency, billingCycle]
  );

  const handlePlanSuccess = (planName: string, displayPrice: number, data: unknown) => {
    setFeedbackMessage(null);
    const response = data as SubscriptionResponse | undefined;
    const symbol = getCurrencySymbol(currency);
    const amountFormatted = `${symbol} ${displayPrice.toFixed(2)} ${currency}`;

    setPaymentModalState({
      clientSecret: response?.clientSecret,
      stripePublicKey: response?.stripePublicKey,
      planName,
      amountFormatted,
    });
  };

  return (
    <main className="relative min-h-screen pb-24 overflow-hidden bg-background text-foreground">
      {/* Background decorative ambient gradient blur */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary-container opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.187rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Hero Header Section */}
      <PlansHero
        billingCycle={billingCycle}
        selectedCurrency={currency}
        onCycleToggle={toggleCycle}
        onCurrencyChange={setCurrency}
      />

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="max-w-2xl mx-auto mt-6 px-4">
          <div
            className={`p-4 rounded-xl text-sm font-medium text-center border ${
              feedbackMessage.type === "success"
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {feedbackMessage.text}
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {plans.map((plan) => {
          const displayPrice = billingCycle === "ANNUAL" ? plan.annualPricePerMonth : plan.monthlyPrice;
          return (
            <PlanCard
              key={plan.id}
              planId={plan.id}
              name={plan.name}
              description={plan.description}
              monthlyPrice={plan.monthlyPrice}
              annualPricePerMonth={plan.annualPricePerMonth}
              currency={currency}
              billingCycle={billingCycle}
              features={[...plan.features]}
              isPopular={plan.isPopular}
              buttonLabel={plan.id === 2 ? "Upgrade to Premium" : "Start with Standard"}
              onSuccess={(data) => handlePlanSuccess(plan.name, displayPrice, data)}
              onError={(err) =>
                setFeedbackMessage({
                  type: "error",
                  text: err || "Failed to process plan selection",
                })
              }
            />
          );
        })}
      </section>

      {/* Embedded Stripe Payment Modal */}
      {paymentModalState && (
        <StripePaymentModal
          isOpen={Boolean(paymentModalState)}
          onClose={() => setPaymentModalState(null)}
          clientSecret={paymentModalState.clientSecret}
          stripePublicKey={paymentModalState.stripePublicKey}
          planName={paymentModalState.planName}
          amountFormatted={paymentModalState.amountFormatted}
        />
      )}
    </main>
  );
}
