"use client";

import { X } from "lucide-react";
import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { useActionState, useEffect } from "react";
import { cancelAppointmentAction } from "../actions/cancel-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "../actions/create-appointment.action";

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
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) => {
      return await cancelAppointmentAction(appointmentId, prevState, formData);
    },
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success" && state.data) {
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  return (
    <>
      <ErrorAlert title="Cancellation Failed" message={state.error ?? undefined} />
      <AlertDialogPrimitive open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent className="relative max-w-md">
          <form action={formAction} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this appointment? This action is permanent and will notify the client.
              </AlertDialogDescription>
            </AlertDialogHeader>

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

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isPending}>
                Go Back
              </AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialogPrimitive>
    </>
  );
}
