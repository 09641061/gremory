"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";

interface FreePlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function FreePlanSuccessModal({
  isOpen,
  onClose,
  onContinue,
}: FreePlanSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Free plan activated
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Free plan activated successfully.
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <CheckCircle2 className="mt-0.5 size-5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Current plan: <span className="text-primary">Free</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free keeps the core product available, but assistant and AI remain hidden.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onContinue} className="min-w-32">
            Start working
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
