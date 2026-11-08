"use client";

import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/contexts/shared/interfaces/components/ui/empty";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title,
  subtitle,
}: AssistantChatEmptyStateProps) {
  const { t } = useAssistantTranslations();
  const displayTitle = title ?? t.chat.emptyStateTitle;
  return (
    <Empty className="border-0 bg-transparent p-0 sm:py-8">
      <EmptyHeader>
        <EmptyContent className="max-w-3xl">
          <h1 className="text-balance text-[1.8rem] font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
            {displayTitle}
          </h1>
          {subtitle ? (
            <EmptyDescription className="max-w-xl sm:text-base">
              {subtitle}
            </EmptyDescription>
          ) : null}
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
