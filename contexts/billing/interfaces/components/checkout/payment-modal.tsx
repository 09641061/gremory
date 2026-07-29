"use client";

import React, { useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { CheckoutForm } from "./checkout-form";
import { PaymentSuccessView } from "./payment-success-view";
import { PaymentErrorView } from "./payment-error-view";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative w-full max-w-lg rounded-lg border-border p-7 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div>
            <h3 id="payment-modal-title" className="text-xl font-bold text-foreground">Complete Subscription</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selected plan: <span className="font-semibold text-foreground">{planName}</span>
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            aria-label="Close payment modal"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
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
      </Card>
    </div>
  );
}
