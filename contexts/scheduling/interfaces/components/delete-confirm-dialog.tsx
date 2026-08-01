"use client";

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
import { useTransition, useState } from "react";
import { deleteAppointmentAction } from "../actions/delete-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";

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
      <AlertDialogPrimitive open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent className="relative max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPrimitive>
    </>
  );
}
