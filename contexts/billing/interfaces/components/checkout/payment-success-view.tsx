"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { getCurrentSubscriptionAction } from "@/contexts/billing/interfaces/actions/get-current-subscription.action";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/contexts/shared/interfaces/components/ui/alert";

export function PaymentSuccessView() {
  const [activationPending, setActivationPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timeoutId: number | undefined;

    const checkSubscription = async () => {
      try {
        const subscription = await getCurrentSubscriptionAction();

        if (cancelled) return;

        if (hasActiveSubscription(subscription)) {
          // Intentional hard navigation (not router.push/refresh): forces the browser
          // to re-request "/" so middleware + server components re-resolve session,
          // onboarding, workspace, and capability state after subscription activation.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign("/");
          return;
        }

        attempts += 1;
        if (attempts < 10) {
          timeoutId = window.setTimeout(checkSubscription, 2000);
        } else {
          setActivationPending(false);
        }
      } catch {
        if (!cancelled) {
          setActivationPending(false);
        }
      }
    };

    void checkSubscription();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="space-y-4 py-5 text-center">
      <Alert className="justify-items-center border-primary/20 bg-primary/10 text-center">
        {activationPending ? (
          <Loader2 className="size-5 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="size-5 text-primary" />
        )}
        <AlertTitle>Payment received</AlertTitle>
        <AlertDescription>
          {activationPending
            ? "Your payment was received. We are activating your subscription."
            : "Your payment was received. Activation is taking longer than usual."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
