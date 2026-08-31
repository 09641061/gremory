"use client";

import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

type AssistantConversationDeleteDialogProps = {
  open: boolean;
  title: string;
  error: string | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AssistantConversationDeleteDialog({
  open,
  title,
  error,
  isSaving,
  onOpenChange,
  onConfirm,
}: AssistantConversationDeleteDialogProps) {
  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      entityLabel="conversation"
      entityName={title}
      pending={isSaving}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
