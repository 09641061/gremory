"use client";

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";

export function AssistantChatThinkingBubble() {
  const { t } = useAssistantTranslations();

  return (
    <div className="flex w-full max-w-[min(48rem,calc(100vw-6rem))] items-start gap-3 sm:max-w-[42rem]" aria-live="polite" aria-label={t.chat.thinkingAria}>
      <AssistantAvatar
        className="mt-1 size-10"
        iconSize={20}
        iconClassName="size-5"
        variant="flat"
      />

      <div className="py-1 text-sm leading-6 text-foreground">
        <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-muted-foreground shadow-sm">
          <span>{t.chat.koduThinking}</span>
          {/* Single-dot pulse: replaced three staggered `animate-bounce` dots with one dot using Tailwind's `animate-pulse` (opacity-only, cubic-bezier easing, no bounce/spring/elastic, no color/position changes). */}
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
          </span>
        </span>
      </div>
    </div>
  );
}
