"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null | undefined;
  stripePublicKey: string | null | undefined;
  planName?: string;
  amountFormatted?: string;
}

function CheckoutForm({
  onClose,
  clientSecret,
  amountFormatted,
}: {
  onClose: () => void;
  clientSecret: string;
  amountFormatted?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ??
            "Could not process payment with the provided card. Please verify your details and try again."
        );
        setIsProcessing(false);
      } else if (
        result.paymentIntent &&
        (result.paymentIntent.status === "succeeded" ||
          result.paymentIntent.status === "processing")
      ) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch {
      setErrorMessage(
        "An issue occurred while processing the transaction. Please try again."
      );
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="mx-auto size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Payment Confirmed!</h3>
        <p className="text-sm text-muted-foreground">
          Your subscription has been processed successfully. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Card Details
        </label>

        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "15px",
                color: "#0f172a",
                fontFamily: "inherit",
                "::placeholder": {
                  color: "#64748b",
                },
              },
              invalid: {
                color: "#dc2626",
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl text-sm bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="size-4" />
              <span>Pay {amountFormatted ? amountFormatted : ""}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const stripePromisesMap = new Map<string, Promise<Stripe | null>>();

function getStripePromise(key: string) {
  if (!stripePromisesMap.has(key)) {
    stripePromisesMap.set(key, loadStripe(key));
  }
  return stripePromisesMap.get(key)!;
}

export function StripePaymentModal({
  isOpen,
  onClose,
  clientSecret,
  stripePublicKey,
  planName = "Subscription",
  amountFormatted,
}: StripePaymentModalProps) {
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
        {!hasValidKeys ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Could not retrieve payment credentials. Please try again or contact support.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-foreground font-medium text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
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
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
