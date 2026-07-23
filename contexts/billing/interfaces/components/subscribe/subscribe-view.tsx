"use client";

import React, { useState, useMemo } from "react";
import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
import { ListPlansQueryService } from "../../../application/internal/queryservices/list-plans-query.service";
import type { SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { SubscribeHero } from "./subscribe-hero";
import { PlanCard } from "./plan-card";
import { PaymentModal } from "./payment-modal";

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

/**
 * SubscribeView component rendering the standalone plan selection interface.
 */
export function SubscribeView() {
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState | null>(null);
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
      {/* Floating ErrorAlert Notification with unique key for re-triggering on repetitive clicks */}
      {feedbackMessage && (
        <ErrorAlert
          key={feedbackMessage.id}
          title={feedbackMessage.type === "error" ? "Acceso Requerido" : "Notificación"}
          message={feedbackMessage.text}
        />
      )}

      {/* Hero Header Section */}
      <SubscribeHero
        billingCycle={billingCycle}
        selectedCurrency={currency}
        onCycleToggle={toggleCycle}
        onCurrencyChange={setCurrency}
      />

      {/* Pricing Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {plans.map((plan) => {
          const displayPrice = billingCycle === "ANNUAL" ? plan.annualPricePerMonth : plan.monthlyPrice;
          return (
            <PlanCard
              key={plan.id}
              planId={plan.id}
              name={plan.name === "Standard" ? "Standart" : plan.name}
              description={plan.description}
              monthlyPrice={plan.monthlyPrice}
              annualPricePerMonth={plan.annualPricePerMonth}
              currency={currency}
              billingCycle={billingCycle}
              features={[...plan.features]}
              isPopular={plan.isPopular}
              buttonLabel={plan.id === 2 ? "Get Premium plan" : "Get Standart plan"}
              onSuccess={(data) => handlePlanSuccess(plan.name, displayPrice, data)}
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

      {/* Footer reassurance note */}
      <p className="text-xs text-center text-muted-foreground mt-12">
        Cancel anytime · Secure billing · Plans can be changed later
      </p>

      {/* Embedded Payment Modal */}
      {paymentModalState && (
        <PaymentModal
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
