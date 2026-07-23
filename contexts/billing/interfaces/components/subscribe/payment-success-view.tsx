"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export function PaymentSuccessView() {
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
