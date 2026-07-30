"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteServiceCategory } from "../../hooks/use-delete-service-category";
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
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const [submitCount, setSubmitCount] = useState(0);
  const { deleteCategory, pending, state } = useDeleteServiceCategory(() => {
    onOpenChange(false);
  });

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
    }
  }, [state.status, onOpenChange]);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitCount((count) => count + 1);
    deleteCategory(categoryId);
  };

  return (
    <>
      <ErrorAlert
        key={state.status === "error" ? `${submitCount}-${state.error}` : `idle-${submitCount}`}
        title="Unable to delete category"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />
      <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form onSubmit={handleDelete}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{categoryName}</span>.
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
