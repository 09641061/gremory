"use client";

import type { AssistantConversationSummary } from "@/contexts/assistant/interfaces/components/shared/assistant-chat.types";

import { AssistantConversationListItem } from "./assistant-conversation-list-item";

type AssistantConversationListProps = {
  conversations: AssistantConversationSummary[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  openMenuId: string | null;
  mutatingConversationId: string | null;
  onOpenMenu: (
    conversation: AssistantConversationSummary,
    menuPosition: { top: number; left: number },
  ) => void;
};

export function AssistantConversationList({
  conversations,
  activeConversationId,
  isLoading,
  error,
  openMenuId,
  mutatingConversationId,
  onOpenMenu,
}: AssistantConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-md bg-muted/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
        {error}
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
        No chats yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {conversations.map((conversation) => {
        const active = conversation.id === activeConversationId;
        const isMutating = mutatingConversationId === conversation.id;

        return (
          <AssistantConversationListItem
            key={conversation.id}
            conversation={conversation}
            active={active}
            isMutating={isMutating}
            isMenuOpen={openMenuId === conversation.id}
            onOpenMenu={onOpenMenu}
          />
        );
      })}
    </ul>
  );
}
