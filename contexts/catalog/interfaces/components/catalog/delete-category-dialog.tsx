"use client";

import { useEffect } from "react";
import { useDeleteServiceCategory } from "../../hooks/use-delete-service-category";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

import { useCatalogTranslations } from "../../i18n";

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
  const { t } = useCatalogTranslations();
  const { deleteCategory, pending, state } = useDeleteServiceCategory(() => {
    onOpenChange(false);
  });

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
    }
  }, [state.status, onOpenChange]);

  return (
    <DeleteConfirmDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
      entityLabel={t.dialogs.deleteCategoryEntityLabel}
      entityName={categoryName}
      pending={pending}
      error={state.status === "error" ? state.error : null}
      onConfirm={() => deleteCategory(categoryId)}
    />
  );
}
