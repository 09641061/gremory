"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteCatalogService } from "../../hooks/use-delete-catalog-service";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

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
  const [submitCount, setSubmitCount] = useState(0);
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

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitCount((count) => count + 1);
    deleteService(serviceId);
  };

  return (
    <>
      <ErrorAlert
        key={state.status === "error" ? `${submitCount}-${state.error}` : `idle-${submitCount}`}
        title="Unable to delete service"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />
      <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form onSubmit={handleDelete}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete service?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{serviceName}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                {pending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
