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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteAppointmentAction(appointmentId);
      if (res.status === "error") {
        setError(res.error);
      } else {
        onSuccess();
        onOpenChange(false);
      }
    });
  };

  return (
    <>
      <ErrorAlert title="Deletion Failed" message={error ?? undefined} />
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
        <AppointmentConfirmDialogHeader
          title="Delete Appointment"
          titleClassName="text-destructive"
          description="Are you sure you want to permanently delete this appointment? This action cannot be undone."
        />
      </AppointmentConfirmDialogShell>
    </>
  );
}
