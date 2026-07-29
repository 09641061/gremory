"use client";

import type { RefObject } from "react";
import { createPortal } from "react-dom";

import { PencilLine, Trash2 } from "lucide-react";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

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
      className="fixed z-[60] w-44 rounded-2xl border border-border/70 bg-background p-1.5 shadow-xl shadow-black/20"
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
    >
      <button
        type="button"
        disabled={isMutating}
        onClick={() => onRename(conversation)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-50"
      >
        <PencilLine className="size-4 text-muted-foreground" />
        <span>Edit name</span>
      </button>
      <button
        type="button"
        disabled={isMutating}
        onClick={() => onDelete(conversation)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-50"
      >
        <Trash2 className="size-4 text-muted-foreground" />
        <span>Delete</span>
      </button>
    </div>,
    document.body,
  );
}
