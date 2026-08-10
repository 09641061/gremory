"use client";

import { useEffect } from "react";
import { useDeleteCatalogService } from "../../hooks/use-delete-catalog-service";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

interface DeleteServiceDialogProps {
  serviceId: string;
  serviceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteServiceDialog({
  serviceId,
  serviceName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteServiceDialogProps) {
  const { deleteService, pending, state } = useDeleteCatalogService(() => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  });

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state.status, onOpenChange, onSuccess]);

  return (
    <DeleteConfirmDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
      entityLabel="service"
      entityName={serviceName}
      pending={pending}
      error={state.status === "error" ? state.error : null}
      onConfirm={() => deleteService(serviceId)}
    />
  );
}
