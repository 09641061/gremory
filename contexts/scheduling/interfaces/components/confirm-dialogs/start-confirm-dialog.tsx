"use client";

import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useTransition, useState } from "react";
import { startAppointmentAction } from "../../actions/start-appointment.action";
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

interface StartConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onSuccess: (updated: Appointment) => void;
}

export function StartConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: StartConfirmDialogProps) {
  const [error, setError] = useState<ActionErrorState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      const res = await startAppointmentAction(appointmentId);
      if (res.status === "error") {
        setError({
          message: res.error ?? "Failed to start appointment",
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
            <Button type="button" variant="default" disabled={isPending} onClick={handleStart}>
              {isPending ? "Starting..." : "Start Appointment"}
            </Button>
          </>
        }
      >
        <ErrorAlert
          key={error?.id ?? "start-error"}
          title="Action Failed"
          message={error?.message ?? undefined}
        />
        <AppointmentConfirmDialogHeader
          title="Start Appointment"
          description="Are you sure you want to start this appointment? This will mark the client as arrived and change the status to In Progress."
        />
      </AppointmentConfirmDialogShell>
    </>
  );
}
