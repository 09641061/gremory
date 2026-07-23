"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface PaymentErrorViewProps {
  message?: string;
  onClose: () => void;
}

export function PaymentErrorView({ message, onClose }: PaymentErrorViewProps) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="mx-auto size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="size-6" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {message ??
          "Could not retrieve payment credentials. Please try again or contact support."}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 px-6 py-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-foreground font-medium text-sm transition-colors cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}
