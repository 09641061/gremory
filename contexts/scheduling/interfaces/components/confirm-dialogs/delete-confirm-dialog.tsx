"use client";

import { AlertDialogCancel } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useTransition, useState } from "react";
import { deleteAppointmentAction } from "../../actions/delete-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import {
  AppointmentConfirmDialogHeader,
  AppointmentConfirmDialogShell,
} from "./appointment-confirm-dialog-shell";

type DeleteErrorState = Readonly<{
  message: string;
  id: string;
}>;

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [error, setError] = useState<DeleteErrorState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteAppointmentAction(appointmentId);
      if (res.status === "error") {
        setError({
          message: res.error,
          id: res.errorId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
      } else {
        onSuccess();
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
            <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </>
        }
      >
        <ErrorAlert
          key={error?.id ?? "delete-error"}
          title="Deletion Failed"
          message={error?.message ?? undefined}
        />
        <AppointmentConfirmDialogHeader
          title="Delete Appointment"
          titleClassName="text-destructive"
          description="Are you sure you want to permanently delete this appointment? This action cannot be undone."
        />
      </AppointmentConfirmDialogShell>
    </>
  );
}
