"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { Mic, Plus, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface AssistantChatComposerProps {
  value: string;
  isSending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  variant?: "default" | "minimal";
}

const MINIMAL_MIN_HEIGHT = 96;
const MINIMAL_MAX_HEIGHT = 180;
const showAuxiliaryActions = false;

export function AssistantChatComposer({
  value,
  isSending,
  onValueChange,
  onSubmit,
  onKeyDown,
  disabled,
  variant = "default",
}: AssistantChatComposerProps) {
  const isMinimal = variant === "minimal";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isMinimal) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MINIMAL_MAX_HEIGHT);
    textarea.style.height = `${Math.max(nextHeight, MINIMAL_MIN_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > MINIMAL_MAX_HEIGHT ? "auto" : "hidden";
  }, [isMinimal, value]);

  return isMinimal ? (
    <div className="px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] border border-border/60 bg-card/90 px-3 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur">
          <label htmlFor="assistant-chat-composer" className="sr-only">
            Escribe tu mensaje
          </label>

          <textarea
            ref={textareaRef}
            id="assistant-chat-composer"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Escribe aqui..."
            disabled={disabled || isSending}
            className={cn(
              "block w-full resize-none border-0 bg-transparent px-3 pt-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground [overflow-wrap:anywhere] break-words focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
              "min-h-[96px]",
            )}
          />

          <div className="mt-3 flex items-center justify-end gap-2 px-1 pb-1">
            {showAuxiliaryActions ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <Plus className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Voice input"
                  title="Voice input"
                >
                  <Mic className="size-4" />
                </Button>
              </>
            ) : null}

            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled || isSending || !value.trim()}
              variant="default"
              size="icon-lg"
              className="rounded-full border border-border/60 bg-background text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-background/90"
              style={{ width: "2.75rem", height: "2.75rem" }}
              aria-label="Enviar mensaje"
            >
              <Send className="size-4" />
              <span className="sr-only">{isSending ? "Enviando" : "Enviar"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
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
          variant="default"
          size="default"
          className="h-12 shrink-0 rounded-3xl px-4"
          aria-label="Enviar mensaje"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">{isSending ? "Enviando" : "Enviar"}</span>
        </Button>
      </div>
    </div>
  );
}
