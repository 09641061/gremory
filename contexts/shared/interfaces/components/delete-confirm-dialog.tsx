"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lowercase noun used in the title and the default error heading, e.g. "service". */
  entityLabel: string;
  /** Name shown to the user so they can confirm what they are deleting. */
  entityName: string;
  pending?: boolean;
  error?: string | null;
  /** Overrides the default "This will permanently delete <name>." sentence. */
  description?: ReactNode;
  /** Blocks confirmation while still explaining why, e.g. protected system records. */
  confirmDisabled?: boolean;
  /** Verb used in the title, the confirm button and the error heading. */
  confirmLabel?: string;
  pendingLabel?: string;
  /** Imperative confirmation. Use this or `formAction`, not both. */
  onConfirm?: () => void;
  /** Server Action form submission. Render hidden inputs as `children`. */
  formAction?: (formData: FormData) => void;
  children?: ReactNode;
}

/**
 * The single delete confirmation dialog used across contexts. It owns the
 * presentation only: the caller keeps its own command/action and passes the
 * resulting `pending` and `error` back in.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  entityLabel,
  entityName,
  pending = false,
  error,
  description,
  confirmDisabled = false,
  confirmLabel = "Delete",
  pendingLabel = "Deleting...",
  onConfirm,
  formAction,
  children,
}: DeleteConfirmDialogProps) {
  // Re-keys the alert so repeating the same error still re-announces it.
  const [submitCount, setSubmitCount] = useState(0);

  const handleSubmit = (event: React.FormEvent) => {
    setSubmitCount((count) => count + 1);
    if (!formAction) {
      event.preventDefault();
      onConfirm?.();
    }
  };

  return (
    <>
      <ErrorAlert
        key={error ? `${submitCount}-${error}` : `idle-${submitCount}`}
        title={`Unable to ${confirmLabel.toLowerCase()} ${entityLabel}`}
        message={error ?? undefined}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form action={formAction} onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{confirmLabel} {entityLabel}?</DialogTitle>
              <DialogDescription>
                {description ?? (
                  <>
                    This will permanently {confirmLabel.toLowerCase()}{" "}
                    <span className="font-medium text-foreground">{entityName}</span>.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              {children}
              <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending || confirmDisabled}
                className="gap-2"
              >
                {pending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                {pending ? pendingLabel : confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
