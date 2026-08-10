"use client";

import type { RefObject } from "react";
import { createPortal } from "react-dom";

import { PencilLine, Trash2 } from "lucide-react";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

type AssistantConversationActionsMenuProps = {
  conversation: AssistantConversationSummaryReadModel | null;
  isMutating: boolean;
  menuPosition: { top: number; left: number } | null;
  menuRef: RefObject<HTMLDivElement | null>;
  onRename: (conversation: AssistantConversationSummaryReadModel) => void;
  onDelete: (conversation: AssistantConversationSummaryReadModel) => void;
};

export function AssistantConversationActionsMenu({
  conversation,
  isMutating,
  menuPosition,
  menuRef,
  onRename,
  onDelete,
}: AssistantConversationActionsMenuProps) {
  if (!conversation || !menuPosition) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[60] w-44 rounded-2xl border border-border/70 bg-background p-1.5 shadow-xl"
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isMutating}
        onClick={() => onRename(conversation)}
        className="h-9 w-full justify-start gap-2 rounded-xl px-3 text-left text-sm font-normal"
      >
        <PencilLine className="size-4 text-muted-foreground" />
        <span>Edit name</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isMutating}
        onClick={() => onDelete(conversation)}
        className="h-9 w-full justify-start gap-2 rounded-xl px-3 text-left text-sm font-normal"
      >
        <Trash2 className="size-4 text-muted-foreground" />
        <span>Delete</span>
      </Button>
    </div>,
    document.body,
  );
}
