"use client";

import { useState, useTransition } from "react";
import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import type { Appointment } from "../../../domain/model/entities/appointment";
import type { ActionState } from "../../actions/action-state";
import { startAppointmentAction } from "../../actions/start-appointment.action";
import { completeAppointmentAction } from "../../actions/complete-appointment.action";
import { markNoShowAppointmentAction } from "../../actions/mark-no-show-appointment.action";
import { AppointmentConfirmDialogShell } from "./appointment-confirm-dialog-shell";

/** Status changes that only need a yes/no confirmation, with no extra input. */
export type AppointmentStatusTransition = "start" | "complete" | "no-show";

type TransitionCopy = Readonly<{
  action: (appointmentId: string) => Promise<ActionState<Appointment>>;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  variant: "default" | "outline";
  fallbackError: string;
}>;

const TRANSITIONS: Readonly<Record<AppointmentStatusTransition, TransitionCopy>> = {
  start: {
    action: startAppointmentAction,
    title: "Start appointment",
    description:
      "This marks the client as arrived and moves the appointment to In Progress.",
    confirmLabel: "Start appointment",
    pendingLabel: "Starting...",
    variant: "default",
    fallbackError: "Failed to start appointment",
  },
  complete: {
    action: completeAppointmentAction,
    title: "Complete appointment",
    description:
      "This marks the service as finished and moves the appointment to Completed.",
    confirmLabel: "Complete appointment",
    pendingLabel: "Completing...",
    variant: "default",
    fallbackError: "Failed to complete appointment",
  },
  "no-show": {
    action: markNoShowAppointmentAction,
    title: "Confirm no show",
    description:
      "This records that the client never arrived and moves the appointment to No Show.",
    confirmLabel: "Confirm no show",
    pendingLabel: "Marking...",
    variant: "outline",
    fallbackError: "Failed to mark appointment as no-show",
  },
};

interface AppointmentStatusConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transition: AppointmentStatusTransition;
  appointmentId: string;
  onSuccess: (updated: Appointment) => void;
}

/**
 * Single confirmation dialog for every no-input status transition.
 *
 * Start, complete and no-show differ only in copy, button variant and the
 * server action they call, so they share one component instead of three
 * near-identical files.
 */
export function AppointmentStatusConfirmDialog({
  isOpen,
  onOpenChange,
  transition,
  appointmentId,
  onSuccess,
}: AppointmentStatusConfirmDialogProps) {
  const copy = TRANSITIONS[transition];
  const [error, setError] = useState<string | null>(null);
  // Re-keys the alert so retrying and failing the same way re-announces it.
  const [attempt, setAttempt] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    setAttempt((count) => count + 1);

    startTransition(async () => {
      const result = await copy.action(appointmentId);
      if (result.status === "success") {
        onSuccess(result.data);
        onOpenChange(false);
        return;
      }
      setError(result.status === "error" ? result.error : copy.fallbackError);
    });
  };

  return (
    <>
      <ErrorAlert
        key={`${transition}-${attempt}`}
        title={copy.title}
        message={error ?? undefined}
      />
      <AppointmentConfirmDialogShell
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={copy.title}
        description={copy.description}
        footer={
          <>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant={copy.variant}
              disabled={isPending}
              onClick={handleConfirm}
              className="gap-2"
            >
              {isPending && <Spinner className="size-4" />}
              {isPending ? copy.pendingLabel : copy.confirmLabel}
            </Button>
          </>
        }
      />
    </>
  );
}
