"use client";

import { useEffect, useRef } from "react";

import { X } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-conversation-title"
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Chat
              </p>
              <h2 id="rename-conversation-title" className="mt-1 text-lg font-semibold">
                Edit chat name
              </h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label htmlFor="conversation-title" className="text-sm font-medium">
                Chat name
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
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSaving || !value.trim() || value.trim().length > 200}
              className="gap-2"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
