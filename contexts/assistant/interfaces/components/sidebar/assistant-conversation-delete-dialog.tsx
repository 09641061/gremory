"use client";

import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";

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
  const { t } = useAssistantTranslations();
  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      entityLabel={t.chat.deleteEntityLabel}
      entityName={title}
      pending={isSaving}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
