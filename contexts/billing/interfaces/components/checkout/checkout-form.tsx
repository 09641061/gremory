"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import {
  Alert,
  AlertDescription,
} from "@/contexts/shared/interfaces/components/ui/alert";

interface CheckoutFormProps {
  onClose: () => void;
  clientSecret: string;
  amountFormatted?: string;
  onSuccessStateChange?: () => void;
}

export function CheckoutForm({
  onClose,
  clientSecret,
  amountFormatted,
  onSuccessStateChange,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      } else {
        onSuccessStateChange?.();
      }
    } catch {
      setErrorMessage(
        "An issue occurred while processing the transaction. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-lg border-border p-4 shadow-xs">
        <Label className="mb-2 text-xs text-foreground">
          Card Details
        </Label>

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
      </Card>

      {errorMessage && (
        <Alert variant="destructive" className="rounded-lg border-destructive/20 bg-destructive/10 p-3.5 text-destructive">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <AlertDescription className="text-destructive">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          variant="outline"
          className="h-10 flex-1 rounded-md px-4 text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="h-10 flex-1 rounded-md px-4 text-sm font-semibold shadow-md"
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
        </Button>
      </div>
    </form>
  );
}
