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
  "block w-full resize-none border-0 bg-transparent px-0 py-0 pl-2 sm:pl-3 text-[15px] leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 break-words [overflow-wrap:anywhere]";
const inputSingleLineClass = "min-h-[24px] max-h-[220px] overflow-hidden";
const inputMultiLineClass = "min-h-[24px] max-h-[220px] overflow-y-auto scrollbar-hide overscroll-contain";
const shellBaseClass =
  "w-full border border-border/30 bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-200 ease-in-out";
const shellSingleLineClass = "rounded-full px-4 py-3";
const shellMultiLineClass = "rounded-2xl px-4 py-4";
const sendActionClass =
  "rounded-full border border-border/30 bg-background text-foreground shadow-md transition-transform hover:scale-105 hover:bg-background/95 disabled:scale-100 disabled:bg-background/80 disabled:text-foreground/50";
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
  const [textareaHeight, setTextareaHeight] = useState(MIN_HEIGHT);

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

    setTextareaHeight(measuredHeight);
  }, [value]);

  const hasText = value.trim().length > 0;
  const isMultiline = hasText && (value.includes("\n") || textareaHeight > SINGLE_LINE_THRESHOLD);
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

  function renderComposerInput(className: string) {
    return (
      <textarea
        ref={textareaRef}
        id="assistant-chat-composer"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask what you need about Takodu"
        disabled={disabled || isSending}
        className={cn(inputBaseClass, className)}
      />
    );
  }

  const shellClasses = cn(
    shellBaseClass,
    composerState === "multiline" ? shellMultiLineClass : shellSingleLineClass,
    isMinimal ? "max-w-3xl" : "max-w-4xl",
    disabled || isSending ? "opacity-95" : "",
  );

  const composerRowClasses = cn(
    "min-h-0",
    composerState === "multiline" ? "flex flex-col gap-3" : "flex items-center gap-3",
  );
  const textareaClasses = composerState === "multiline" ? inputMultiLineClass : inputSingleLineClass;
  const actionWrapClasses = cn(
    composerState === "multiline" ? "flex items-center justify-between gap-3 border-t border-border/60 pt-3" : "shrink-0",
  );
  const actionSpacer = composerState === "multiline" ? <div aria-hidden="true" className="flex-1" /> : null;

  return isMinimal ? (
    <div className="px-4 pb-10 pt-2 sm:px-6 sm:pb-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className={shellClasses} data-composer-state={composerState} data-testid="assistant-composer-shell">
          <label htmlFor="assistant-chat-composer" className="sr-only">
            Ask what you need about Takodu
          </label>

          <div className={composerRowClasses}>
            <div className="min-w-0 flex-1">{renderComposerInput(textareaClasses)}</div>
            <div className={actionWrapClasses}>
              {actionSpacer}
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="mx-auto w-full max-w-4xl">
      <div className={shellClasses} data-composer-state={composerState} data-testid="assistant-composer-shell">
        <label htmlFor="assistant-chat-composer" className="sr-only">
          Ask what you need about Takodu
        </label>

        <div className={composerRowClasses}>
          <div className="min-w-0 flex-1">{renderComposerInput(textareaClasses)}</div>
          <div className={actionWrapClasses}>
            {actionSpacer}
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
