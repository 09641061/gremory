"use client";

import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useTransition, useState } from "react";
import { completeAppointmentAction } from "../../actions/complete-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../../domain/model/entities/appointment";
import {
  AppointmentConfirmDialogHeader,
  AppointmentConfirmDialogShell,
} from "./appointment-confirm-dialog-shell";

type ActionErrorState = Readonly<{
  message: string;
  id: string;
}>;

interface CompleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onSuccess: (updated: Appointment) => void;
}

export function CompleteConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: CompleteConfirmDialogProps) {
  const [error, setError] = useState<ActionErrorState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeAppointmentAction(appointmentId);
      if (res.status === "error") {
        setError({
          message: res.error ?? "Failed to complete appointment",
          id: res.errorId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
      } else if (res.data) {
        onSuccess(res.data);
        onOpenChange(false);
      }
    });
  };

  return (
    <>
      <AppointmentConfirmDialogShell
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        footer={
          <>
            <AlertDialogCancel type="button" disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <Button type="button" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending} onClick={handleComplete}>
              {isPending ? "Completing..." : "Complete Appointment"}
            </Button>
          </>
        }
      >
        <ErrorAlert
          key={error?.id ?? "complete-error"}
          title="Action Failed"
          message={error?.message ?? undefined}
        />
        <AppointmentConfirmDialogHeader
          title="Complete Appointment"
          description="Are you sure you want to complete this appointment? This will mark the service as finished and change the status to Completed."
        />
      </AppointmentConfirmDialogShell>
    </>
  );
}
