"use client";

import React, { useTransition } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { cancelSubscriptionAction } from "../../actions/cancel-subscription.action";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  onCancelled: () => void;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  planName,
  onCancelled,
}: CancelSubscriptionModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (result.status === "success") {
        onCancelled();
        onClose();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive shrink-0" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Confirm plan cancellation.
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Are you sure you want to cancel your <span className="font-semibold text-primary">{planName}</span> plan?
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You will retain access to your premium features, including the AI assistant and unlimited establishments, until the end of your current billing period. After this date, you will automatically downgrade to the Free plan.
          </p>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
            className="min-w-24"
          >
            Keep plan
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleCancel}
            className="min-w-32 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Cancel subscription"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
