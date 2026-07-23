"use client";

import React, { useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { CheckoutForm } from "./checkout-form";
import { PaymentSuccessView } from "./payment-success-view";
import { PaymentErrorView } from "./payment-error-view";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null | undefined;
  stripePublicKey: string | null | undefined;
  planName?: string;
  amountFormatted?: string;
}

const stripePromisesMap = new Map<string, Promise<Stripe | null>>();

function getStripePromise(key: string) {
  if (!stripePromisesMap.has(key)) {
    stripePromisesMap.set(key, loadStripe(key));
  }
  return stripePromisesMap.get(key)!;
}

export function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  stripePublicKey,
  planName = "Subscription",
  amountFormatted,
}: PaymentModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const hasValidKeys = Boolean(clientSecret && stripePublicKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Complete Subscription</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selected plan: <span className="font-semibold text-foreground">{planName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <PaymentSuccessView />
        ) : !hasValidKeys ? (
          <PaymentErrorView onClose={onClose} />
        ) : (
          <Elements
            stripe={getStripePromise(stripePublicKey!)}
            options={{
              clientSecret: clientSecret!,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#3b82f6",
                  colorBackground: "#ffffff",
                  colorText: "#0f172a",
                },
              },
            }}
          >
            <CheckoutForm
              onClose={onClose}
              clientSecret={clientSecret!}
              amountFormatted={amountFormatted}
              onSuccessStateChange={() => setIsSuccess(true)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
