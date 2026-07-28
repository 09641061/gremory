"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

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

const MIN_HEIGHT = 24;
const MAX_HEIGHT = 220;
const SINGLE_LINE_THRESHOLD = 58;
const inputBaseClass =
  "block w-full resize-none border-0 bg-transparent px-0 py-0 text-[15px] leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 break-words [overflow-wrap:anywhere]";
const inputSingleLineClass = "min-h-[24px] max-h-[220px] overflow-hidden";
const inputMultiLineClass = "min-h-[24px] max-h-[220px] overflow-y-auto scrollbar-hide overscroll-contain";
const shellBaseClass =
  "w-full border border-border/70 bg-background/95 text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-200 ease-in-out";
const shellSingleLineClass = "rounded-full px-4 py-3";
const shellMultiLineClass = "rounded-[24px] px-4 py-4";
const sendActionClass =
  "rounded-full border border-border/70 bg-white text-foreground shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-transform hover:scale-105 hover:bg-white/95 disabled:scale-100 disabled:bg-white/80 disabled:text-foreground/50";
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
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const measuredHeight = textarea.scrollHeight;
    const nextHeight = Math.min(Math.max(measuredHeight, MIN_HEIGHT), MAX_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = measuredHeight > MAX_HEIGHT ? "auto" : "hidden";
    textarea.style.overflowWrap = "anywhere";
    textarea.style.wordBreak = "break-word";

    const wrappedIntoMultipleLines = value.includes("\n") || measuredHeight > SINGLE_LINE_THRESHOLD;
    setIsMultiline(wrappedIntoMultipleLines);
  }, [value]);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "0px";
      const measuredHeight = textarea.scrollHeight;
      const nextHeight = Math.min(Math.max(measuredHeight, MIN_HEIGHT), MAX_HEIGHT);
      textarea.style.height = `${nextHeight}px`;
      textarea.style.overflowY = measuredHeight > MAX_HEIGHT ? "auto" : "hidden";
      setIsMultiline(value.includes("\n") || measuredHeight > SINGLE_LINE_THRESHOLD);
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [value]);

  const hasText = value.trim().length > 0;
  const composerState = !hasText ? "empty" : isMultiline ? "multiline" : "single-line";

  function handlePrimaryAction() {
    if (!hasText) return;
    onSubmit();
  }

  function renderActionButton() {
    return (
      <Button
        type="button"
        onClick={handlePrimaryAction}
        disabled={disabled || isSending}
        variant="ghost"
        size="icon-lg"
        className={sendActionClass}
        aria-label={isSending ? "Sending" : "Send message"}
      >
        <ArrowUp className="size-4" />
        <span className="sr-only">{isSending ? "Sending" : "Send message"}</span>
      </Button>
    );
  }

  const shellClasses = cn(
    shellBaseClass,
    composerState === "multiline" ? shellMultiLineClass : shellSingleLineClass,
    isMinimal ? "max-w-3xl" : "max-w-4xl",
    disabled || isSending ? "opacity-95" : "",
  );

  return isMinimal ? (
    <div className="px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
      <div className="mx-auto w-full max-w-3xl">
        <div
          ref={shellRef}
          className={shellClasses}
          data-composer-state={composerState}
          data-testid="assistant-composer-shell"
        >
          <label htmlFor="assistant-chat-composer" className="sr-only">
            Pregunta lo que quieras
          </label>

          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <textarea
                ref={textareaRef}
                id="assistant-chat-composer"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Preguntar lo que quieras"
                disabled={disabled || isSending}
                className={cn(
                  inputBaseClass,
                  inputSingleLineClass,
                )}
              />
            </div>

            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="border-t border-border/60 bg-background/95 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div
          ref={shellRef}
          className={shellClasses}
          data-composer-state={composerState}
          data-testid="assistant-composer-shell"
        >
          <label htmlFor="assistant-chat-composer" className="sr-only">
            Pregunta lo que quieras
          </label>

          {composerState === "multiline" ? (
            <div className="flex min-h-0 flex-col gap-3">
              <textarea
                ref={textareaRef}
                id="assistant-chat-composer"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Preguntar lo que quieras"
                disabled={disabled || isSending}
                className={cn(
                  inputBaseClass,
                  inputMultiLineClass,
                )}
              />

              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                <div />
                {renderActionButton()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <textarea
                  ref={textareaRef}
                  id="assistant-chat-composer"
                  value={value}
                  onChange={(event) => onValueChange(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Preguntar lo que quieras"
                  disabled={disabled || isSending}
                  className={cn(
                    inputBaseClass,
                    inputSingleLineClass,
                  )}
                />
              </div>

              {renderActionButton()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
