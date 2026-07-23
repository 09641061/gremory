"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/contexts/shared/interfaces/components/ui/alert";

interface PaymentErrorViewProps {
  message?: string;
  onClose: () => void;
}

export function PaymentErrorView({ message, onClose }: PaymentErrorViewProps) {
  return (
    <div className="space-y-4 py-5 text-center">
      <Alert variant="destructive" className="justify-items-center border-destructive/20 bg-destructive/10 text-center">
        <AlertCircle className="size-5" />
        <AlertTitle>Payment unavailable</AlertTitle>
        <AlertDescription className="text-destructive">
          {message ??
            "Could not retrieve payment credentials. Please try again or contact support."}
        </AlertDescription>
      </Alert>
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        className="h-10 rounded-md px-4 text-sm"
      >
        Close
      </Button>
    </div>
  );
}
