"use client";

import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface AssistantChatComposerProps {
  value: string;
  isSending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export function AssistantChatComposer({
  value,
  isSending,
  onValueChange,
  onSubmit,
  onKeyDown,
  disabled,
}: AssistantChatComposerProps) {
  return (
    <div className="border-t border-border/60 bg-background/95 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-4xl items-end gap-3">
        <div className="flex-1">
          <label htmlFor="assistant-chat-composer" className="sr-only">
            Escribe tu mensaje
          </label>
          <textarea
            id="assistant-chat-composer"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Escribe un mensaje..."
            disabled={disabled || isSending}
            className="min-h-24 w-full resize-none rounded-3xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSending || !value.trim()}
          className="h-12 rounded-3xl px-4"
          aria-label="Enviar mensaje"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">
            {isSending ? "Enviando" : "Enviar"}
          </span>
        </Button>
      </div>
    </div>
  );
}
