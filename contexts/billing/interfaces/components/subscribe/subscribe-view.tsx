"use client";

import React, { useMemo, useState } from "react";

import type { BillingCycleType } from "../../../domain/model/value-objects/billing-cycle";
import { getCurrencySymbol, type CurrencyCode } from "../../../domain/model/value-objects/currency";
// Type-only: erased at compile time, so the server-only module is never bundled.
import type {
  PlanReadModel,
  PlansByCurrencyReadModel,
} from "../../../application/internal/queryservices/list-plans-query.service";
import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import type { CreateSubscriptionActionErrorKind } from "../../actions/create-subscription.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { BackNavigationButton } from "@/contexts/shared/interfaces/components/navigation/back-navigation-button";
import { SubscribeHero } from "./subscribe-hero";
import { PlanCard } from "./plan-card";
import { PaymentModal } from "../checkout/payment-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { useBillingI18n } from "@/contexts/billing/interfaces/i18n";

interface ActivePaymentState {
  clientSecret: string | null | undefined;
  stripePublicKey: string | null | undefined;
  planName: string;
  amountFormatted: string;
}

interface FeedbackState {
  type: "error";
  text: string;
  kind: CreateSubscriptionActionErrorKind;
  id: number;
}

type BillingPlanMetadata = {
  description: string;
  features: string[];
  isPopular: boolean;
};

type BillingPlanViewModel = PlanReadModel & BillingPlanMetadata;

function getPlanMetadata(
  planId: number,
  t: ReturnType<typeof useBillingI18n>["t"]
): BillingPlanMetadata | null {
  if (planId === 1) {
    return {
      description: t.subscribe.metadata.standardDescription,
      features: [
        t.subscribe.metadata.standardFeature1,
        t.subscribe.metadata.standardFeature2,
        t.subscribe.metadata.standardFeature3,
        t.subscribe.metadata.standardFeature4,
        t.subscribe.metadata.standardFeature5,
        t.subscribe.metadata.standardFeature6,
      ],
      isPopular: false,
    };
  }
  if (planId === 2) {
    return {
      description: t.subscribe.metadata.premiumDescription,
      features: [
        t.subscribe.metadata.premiumFeature1,
        t.subscribe.metadata.premiumFeature2,
        t.subscribe.metadata.premiumFeature3,
        t.subscribe.metadata.premiumFeature4,
        t.subscribe.metadata.premiumFeature5,
        t.subscribe.metadata.premiumFeature6,
        t.subscribe.metadata.premiumFeature7,
      ],
      isPopular: true,
    };
  }
  return null;
}

function enrichPlan(
  plan: PlanReadModel,
  t: ReturnType<typeof useBillingI18n>["t"]
): BillingPlanViewModel | null {
  const metadata = getPlanMetadata(plan.id, t);
  if (!metadata) return null;

  return {
    ...plan,
    ...metadata,
  };
}

interface SubscribeViewProps {
  /** Where the back arrow returns to. The page resolves it from the plan. */
  backHref: string;
  /** Every supported currency, priced server-side, so switching costs nothing. */
  plansByCurrency: PlansByCurrencyReadModel;
  currentSubscription?: SubscriptionAccessSnapshot | null;
}

export function SubscribeView({ backHref, plansByCurrency, currentSubscription }: SubscribeViewProps) {
  const { t } = useBillingI18n();
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState | null>(null);
  const [paymentModalState, setPaymentModalState] = useState<ActivePaymentState | null>(null);
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);
  const plans = useMemo(
    () =>
      (plansByCurrency[currency] ?? [])
        .map((p) => enrichPlan(p, t))
        .filter((plan): plan is BillingPlanViewModel => plan !== null)
        .sort((left, right) => left.id - right.id),
    [plansByCurrency, currency, t]
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
        <BackNavigationButton fallbackHref={backHref} />
      </div>

      {feedbackMessage ? (
        <ErrorAlert
          key={feedbackMessage.id}
          title={
            feedbackMessage.kind === "authentication"
              ? t.subscribe.signInRequired
              : feedbackMessage.kind === "authorization"
              ? t.subscribe.billingAccessRequired
              : t.subscribe.operationError
          }
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

            const isPendingThisPlan =
              currentSubscription?.pendingPlanId === plan.id &&
              currentSubscription?.pendingBillingCycle === billingCycle;

            const buttonLabel = isCurrent
              ? t.subscribe.currentPlan
              : isPendingThisPlan
              ? t.subscribe.retryPayment
              : t.subscribe.getPlan.replace("{name}", plan.name);

            const localizedMetadata =
              plan.id === 2
                ? {
                    description: t.subscribe.metadata.premiumDescription,
                    features: [
                      t.subscribe.metadata.premiumFeature1,
                      t.subscribe.metadata.premiumFeature2,
                      t.subscribe.metadata.premiumFeature3,
                      t.subscribe.metadata.premiumFeature4,
                      t.subscribe.metadata.premiumFeature5,
                      t.subscribe.metadata.premiumFeature6,
                      t.subscribe.metadata.premiumFeature7,
                    ].filter(Boolean),
                  }
                : {
                    description: t.subscribe.metadata.standardDescription,
                    features: [
                      t.subscribe.metadata.standardFeature1,
                      t.subscribe.metadata.standardFeature2,
                      t.subscribe.metadata.standardFeature3,
                      t.subscribe.metadata.standardFeature4,
                      t.subscribe.metadata.standardFeature5,
                      t.subscribe.metadata.standardFeature6,
                    ].filter(Boolean),
                  };

            return (
              <PlanCard
                key={plan.id}
                planId={plan.id}
                name={plan.name}
                description={localizedMetadata.description || plan.description}
                monthlyPrice={plan.monthlyPriceAmount}
                annualPricePerMonth={plan.annualPriceAmount / 12}
                currency={currency}
                billingCycle={billingCycle}
                features={localizedMetadata.features.length > 0 ? localizedMetadata.features : [...plan.features]}
                isPopular={plan.isPopular}
                buttonLabel={buttonLabel}
                buttonDisabled={isCurrent}
                onSuccess={(data) => handlePlanSuccess(plan, displayPrice, data)}
                onError={(err) =>
                  setFeedbackMessage({
                    type: "error",
                    text: err.message || t.subscribe.operationError,
                    kind: err.kind,
                    id: Date.now(),
                  })
                }
                onSelect={(execute) => {
                  // If no subscription or no active subscription, go straight to payment
                  if (!currentSubscription || !currentSubscription.active || !currentSubscription.planId) {
                    execute();
                    return;
                  }
                  
                  const currentPlanId = currentSubscription.planId;
                  const targetPlanId = plan.id;
                  
                  if (targetPlanId > currentPlanId) {
                    // Upgrade: show confirmation dialog
                    setConfirmDialogState({
                      isOpen: true,
                      title: t.subscribe.confirmUpgradeTitle.replace("{planName}", plan.name),
                      description: t.subscribe.confirmUpgradeDescription.replace("{planName}", plan.name),
                      action: () => {
                        setConfirmDialogState(null);
                        execute();
                      }
                    });
                  } else if (targetPlanId < currentPlanId) {
                    // Downgrade
                    setConfirmDialogState({
                      isOpen: true,
                      title: t.subscribe.confirmDowngradeTitle.replace("{planName}", plan.name),
                      description: t.subscribe.confirmDowngradeDescription
                        .replace("{planName}", plan.name)
                        .replace("{currentPlan}", currentSubscription?.planName ?? "your current"),
                      action: () => {
                        setConfirmDialogState(null);
                        execute();
                      }
                    });
                  } else {
                    execute();
                  }
                }}
              />
            );
          })}
        </section>
      </div>

      <div className="flex flex-col items-center gap-2 mt-12">
        <p className="text-xs text-center text-muted-foreground">
          {t.subscribe.cancelAnytime}
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

      {/* Confirmation Modal */}
      {confirmDialogState && (
        <AlertDialog open={confirmDialogState.isOpen} onOpenChange={(open) => !open && setConfirmDialogState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialogState.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialogState.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDialogState(null)}>{t.subscribe.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDialogState.action}>{t.subscribe.proceed}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}
