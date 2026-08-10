"use client";

import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useTransition, useState } from "react";
import { markNoShowAppointmentAction } from "../../actions/mark-no-show-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Appointment } from "../../../domain/model/entities/appointment";
import {
  AppointmentConfirmDialogHeader,
  AppointmentConfirmDialogShell,
} from "./appointment-confirm-dialog-shell";

type ActionErrorState = Readonly<{
  message: string;
  id: string;
}>;

interface NoShowConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onSuccess: (updated: Appointment) => void;
}

export function NoShowConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: NoShowConfirmDialogProps) {
  const [error, setError] = useState<ActionErrorState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNoShow = () => {
    startTransition(async () => {
      const res = await markNoShowAppointmentAction(appointmentId);
      if (res.status === "error") {
        setError({
          message: res.error ?? "Failed to mark appointment as no-show",
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
            <Button type="button" variant="outline" disabled={isPending} onClick={handleNoShow}>
              {isPending ? "Marking..." : "Confirm No Show"}
            </Button>
          </>
        }
      >
        <ErrorAlert
          key={error?.id ?? "noshow-error"}
          title="Action Failed"
          message={error?.message ?? undefined}
        />
        <AppointmentConfirmDialogHeader
          title="Confirm No Show"
          description="Are you sure you want to mark this appointment as a no-show? This indicates the client failed to arrive."
        />
      </AppointmentConfirmDialogShell>
    </>
  );
}
