"use client";

import { useState, useTransition } from "react";
import { deleteAppointmentAction } from "../../actions/delete-appointment.action";
import { DeleteConfirmDialog as SharedDeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

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
    setError(null);
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
    <SharedDeleteConfirmDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      entityLabel="appointment"
      entityName=""
      pending={isPending}
      error={error}
      description="This will permanently delete this appointment. This action cannot be undone."
      onConfirm={handleDelete}
    />
  );
}
