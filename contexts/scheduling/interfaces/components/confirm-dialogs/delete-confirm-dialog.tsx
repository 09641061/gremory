"use client";

import { useState, useTransition } from "react";
import { deleteAppointmentAction } from "../../actions/delete-appointment.action";
import { DeleteConfirmDialog as SharedDeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  /** Shown in the dialog so the user can confirm what they are deleting. */
  appointmentTitle: string;
  onSuccess: () => void;
}

import { useSchedulingTranslations } from "../../i18n";

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  appointmentTitle,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const { t } = useSchedulingTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAppointmentAction(appointmentId);
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      onSuccess();
      onOpenChange(false);
    });
  };

  return (
    <SharedDeleteConfirmDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      entityLabel={t.dialogs.deleteEntityLabel}
      entityName={appointmentTitle}
      pending={isPending}
      error={error}
      onConfirm={handleDelete}
    />
  );
}
