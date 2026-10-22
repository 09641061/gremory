"use client";

import { useEffect } from "react";
import { useDeleteServiceCategory } from "../../hooks/use-delete-service-category";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/dialogs/delete-confirm-dialog";

import { useCatalogTranslations } from "../../i18n";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  establishmentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  establishmentId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const { t } = useCatalogTranslations();
  const { deleteCategory, pending, state } = useDeleteServiceCategory(() => {
    onOpenChange(false);
    onSuccess?.();
  });

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
      onSuccess?.();
    }
  }, [state.status, onOpenChange, onSuccess]);

  return (
    <DeleteConfirmDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
      entityLabel={t.dialogs.deleteCategoryEntityLabel}
      entityName={categoryName}
      pending={pending}
      error={state.status === "error" ? state.error : null}
      onConfirm={() => deleteCategory(categoryId, establishmentId)}
    />
  );
}
