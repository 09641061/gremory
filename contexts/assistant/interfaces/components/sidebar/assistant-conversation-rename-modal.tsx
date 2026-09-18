"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";

type AssistantConversationRenameModalProps = {
  open: boolean;
  conversationTitle: string;
  value: string;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function AssistantConversationRenameModal({
  open,
  conversationTitle,
  value,
  error,
  isSaving,
  onClose,
  onChange,
  onSubmit,
}: AssistantConversationRenameModalProps) {
  const { t } = useAssistantTranslations();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.chat.editChat}</DialogTitle>
          <DialogDescription>
            {t.chat.renameChatPrompt.replace("{title}", conversationTitle)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="conversation-title" className="text-sm font-medium">
            {t.chat.chatName}
          </label>
          <Input
            ref={inputRef}
            id="conversation-title"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={conversationTitle}
            maxLength={200}
            disabled={isSaving}
            className="h-10"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t.chat.cancel}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSaving || !value.trim() || value.trim().length > 200}
            className="gap-2"
          >
            {isSaving ? t.chat.saving : t.chat.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
