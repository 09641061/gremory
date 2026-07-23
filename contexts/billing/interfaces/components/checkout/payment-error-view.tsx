"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface PaymentErrorViewProps {
  message?: string;
  onClose: () => void;
}

export function PaymentErrorView({ message, onClose }: PaymentErrorViewProps) {
  return (
    <div className="space-y-4 py-5 text-center">
      <div className="mx-auto size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="size-6" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {message ??
          "Could not retrieve payment credentials. Please try again or contact support."}
      </p>
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        size="lg"
        className="mt-4 rounded-md px-4 text-sm font-medium text-foreground"
      >
        Close
      </Button>
    </div>
  );
}
