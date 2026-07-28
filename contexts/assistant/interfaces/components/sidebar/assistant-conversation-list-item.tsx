"use client";

import Link from "next/link";

import { MoreHorizontal } from "lucide-react";

import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import type { AssistantConversationSummary } from "@/contexts/assistant/interfaces/components/shared/assistant-chat.types";
import { cn } from "@/lib/utils";

type AssistantConversationListItemProps = {
  conversation: AssistantConversationSummary;
  active: boolean;
  isMutating: boolean;
  isMenuOpen: boolean;
  onOpenMenu: (
    conversation: AssistantConversationSummary,
    menuPosition: { top: number; left: number },
  ) => void;
};

export function AssistantConversationListItem({
  conversation,
  active,
  isMutating,
  isMenuOpen,
  onOpenMenu,
}: AssistantConversationListItemProps) {
  return (
    <li>
      <div className="relative flex items-center gap-1.5 rounded-2xl">
        <Link
          href={`/chat?conversationId=${encodeURIComponent(conversation.id)}`}
          aria-current={active ? "page" : undefined}
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "min-w-0 flex-1 justify-start gap-2.5 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-foreground hover:border-accent/40 hover:bg-accent/70 hover:text-accent-foreground",
            active &&
              "!border-accent/40 !bg-accent !text-accent-foreground hover:!border-accent/40 hover:!bg-accent hover:!text-accent-foreground",
          )}
        >
          <span className="truncate">{conversation.title}</span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isMutating}
          aria-label={`Options for ${conversation.title}`}
          aria-expanded={isMenuOpen}
          onClick={(event) => {
            const currentTarget = event.currentTarget;
            const rect = currentTarget.getBoundingClientRect();
            const estimatedMenuHeight = 116;
            const estimatedMenuWidth = 176;
            const top = Math.max(4, rect.top - estimatedMenuHeight + 20);
            const left = Math.max(
              8,
              Math.min(rect.right - estimatedMenuWidth, window.innerWidth - estimatedMenuWidth - 8),
            );

            onOpenMenu(conversation, { top, left });
          }}
          className={cn(
            "shrink-0 rounded-full border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
            isMenuOpen && "bg-muted text-foreground",
          )}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </li>
  );
}
