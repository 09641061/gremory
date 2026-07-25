"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/contexts/shared/interfaces/components/ui/alert";

export function PaymentSuccessView() {
  const router = useRouter();
  const [activationPending, setActivationPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/billing/subscription/status", { cache: "no-store" });
        const status = response.ok
          ? (await response.json()) as { active?: boolean }
          : { active: false };

        if (cancelled) return;
        if (status.active === true) {
          router.replace("/chat");
          return;
        }

        attempts += 1;
        if (attempts < 10) {
          window.setTimeout(checkSubscription, 2000);
        } else {
          setActivationPending(false);
        }
      } catch {
        if (!cancelled) setActivationPending(false);
      }
    };

    void checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
      <Button type="button" variant="outline" onClick={() => router.replace("/chat")}>
        Continue to chat
      </Button>
    </div>
  );
}
