"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/contexts/shared/interfaces/components/ui/alert";

export function PaymentSuccessView() {
  return (
    <div className="py-5 text-center">
      <Alert className="justify-items-center border-primary/20 bg-primary/10 text-center">
        <CheckCircle2 className="size-5 text-primary" />
        <AlertTitle>Payment Confirmed!</AlertTitle>
        <AlertDescription>
          Your subscription has been processed successfully. Redirecting to dashboard...
        </AlertDescription>
      </Alert>
    </div>
  );
}
