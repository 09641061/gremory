"use client";

import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { useActionState, useEffect, useRef } from "react";
import { cancelAppointmentAction } from "../../actions/cancel-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Appointment } from "../../../domain/model/entities/appointment";
import { ActionState } from "../../actions/action-state";
import { AppointmentConfirmDialogHeader, AppointmentConfirmDialogShell } from "./appointment-confirm-dialog-shell";

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

export function CancelConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: CancelConfirmDialogProps) {
  const appointmentIdRef = useRef(appointmentId);

  useEffect(() => {
    appointmentIdRef.current = appointmentId;
  }, [appointmentId]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) => {
      return await cancelAppointmentAction(appointmentIdRef.current, prevState, formData);
    },
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
      <AppointmentConfirmDialogShell
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        footer={
          <>
            <AlertDialogCancel type="button" disabled={isPending}>
              Go Back
            </AlertDialogCancel>
            <Button type="submit" form="cancel-appointment-form" variant="destructive" disabled={isPending}>
              {isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </>
        }
      >
        <ErrorAlert
          key={(state.status === "error" ? state.errorId : null) ?? "cancel-error"}
          title="Cancellation Failed"
          message={state.error ?? undefined}
        />
        <form id="cancel-appointment-form" action={formAction} className="space-y-4">
          <AppointmentConfirmDialogHeader
            title="Cancel Appointment"
            titleClassName="text-destructive text-lg font-semibold"
            description="Are you sure you want to cancel this appointment? This action is permanent and will notify the client."
          />

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Reason for cancellation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              name="reason"
              placeholder="Please enter a reason for cancellation..."
              required
              className="min-h-[80px]"
            />
          </div>
        </form>
      </AppointmentConfirmDialogShell>
    </>
  );
}
