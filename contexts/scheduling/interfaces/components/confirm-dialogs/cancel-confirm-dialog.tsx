"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { cancelAppointmentAction } from "../../actions/cancel-appointment.action";
import type { Appointment } from "../../../domain/model/entities/appointment";
import type { ActionState } from "../../actions/action-state";
import { AppointmentConfirmDialogShell } from "./appointment-confirm-dialog-shell";

const FORM_ID = "cancel-appointment-form";

interface CancelConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onSuccess: (updatedAppointment: Appointment) => void;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

/**
 * Cancellation is the one transition that collects input (a reason), so it
 * keeps its own form instead of using `AppointmentStatusConfirmDialog`.
 */
export function CancelConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: CancelConfirmDialogProps) {
  // Keeps the submitted id current without re-creating the action identity.
  const appointmentIdRef = useRef(appointmentId);
  useEffect(() => {
    appointmentIdRef.current = appointmentId;
  }, [appointmentId]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) =>
      cancelAppointmentAction(appointmentIdRef.current, prevState, formData),
    initialActionState
  );

  const hasSucceeded = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.data && !hasSucceeded.current) {
      hasSucceeded.current = true;
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state.status, state.data, onSuccess, onOpenChange]);

  return (
    <>
      <ErrorAlert
        key={(state.status === "error" ? state.errorId : null) ?? "cancel-error"}
        title="Cancellation failed"
        message={state.error ?? undefined}
      />
      <AppointmentConfirmDialogShell
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        tone="destructive"
        title="Cancel appointment"
        description="This is permanent and notifies the client. Tell them why so the reason shows on the appointment."
        footer={
          <>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <Button
              type="submit"
              form={FORM_ID}
              variant="destructive"
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Spinner className="size-4" />}
              {isPending ? "Cancelling..." : "Cancel appointment"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} action={formAction} className="space-y-1.5">
          <Label htmlFor="cancel-reason">
            Reason for cancellation <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            name="reason"
            placeholder="Please enter a reason for cancellation..."
            required
            aria-describedby={state.fieldErrors?.reason ? "cancel-reason-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.reason)}
            className="min-h-20"
          />
          {state.fieldErrors?.reason && (
            <p id="cancel-reason-error" className="text-xs text-destructive">
              {state.fieldErrors.reason[0]}
            </p>
          )}
        </form>
      </AppointmentConfirmDialogShell>
    </>
  );
}
