"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { cn } from "@/lib/utils";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { AssistantConversationActionsMenu } from "./assistant-conversation-actions-menu";
import { AssistantConversationDeleteDialog } from "./assistant-conversation-delete-dialog";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantConversationRenameModal } from "./assistant-conversation-rename-modal";
import { useAssistantConversationSidebar } from "./use-assistant-conversation-sidebar";

export function AssistantChatsSection({
  initialConversations,
}: {
  initialConversations: AssistantConversationSummaryReadModel[];
}) {
  const {
    activeConversationId,
    conversations,
    deleteError,
    deleteModalConversation,
    error,
    isDeleteSaving,
    isLoading,
    isOpen,
    isRenameSaving,
    menuPosition,
    menuRef,
    mutatingConversationId,
    openConversation,
    openDeleteConversation,
    openRenameConversation,
    openMenuId,
    renameError,
    renameModalConversation,
    renameTitle,
    sectionRef,
    setDeleteError,
    setDeleteModalConversation,
    setMenuPosition,
    setOpenMenuId,
    setRenameError,
    setRenameModalConversation,
    setRenameTitle,
    submitDeleteConversation,
    submitRenameConversation,
    toggleOpen,
  } = useAssistantConversationSidebar(initialConversations);

  return (
    <section ref={sectionRef} className="mt-2">
      <Button
        type="button"
        variant="ghost"
        onClick={toggleOpen}
        className="h-10 w-full justify-between rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground"
        aria-expanded={isOpen}
      >
        <span>Chats</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {isOpen ? (
        <div className="mt-2 pl-2">
          <div className="max-h-[18rem] space-y-2 overflow-y-auto pr-1">
            <AssistantConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              isLoading={isLoading}
              error={error}
              openMenuId={openMenuId}
              mutatingConversationId={mutatingConversationId}
              onOpenMenu={(nextConversation, nextMenuPosition) => {
                setMenuPosition((current) =>
                  current && openMenuId === nextConversation.id ? null : nextMenuPosition,
                );
                setOpenMenuId((current) =>
                  current === nextConversation.id ? null : nextConversation.id,
                );
              }}
            />
          </div>
        </div>
      ) : null}

      <AssistantConversationActionsMenu
        conversation={openConversation}
        isMutating={openConversation ? mutatingConversationId === openConversation.id : false}
        menuPosition={menuPosition}
        menuRef={menuRef}
        onRename={(conversation) => {
          openRenameConversation(conversation);
          setMenuPosition(null);
        }}
        onDelete={(conversation) => {
          openDeleteConversation(conversation);
          setMenuPosition(null);
        }}
      />

      <AssistantConversationRenameModal
        open={renameModalConversation !== null}
        conversationTitle={renameModalConversation?.title ?? "Nueva conversacion"}
        value={renameTitle}
        error={renameError}
        isSaving={isRenameSaving}
        onClose={() => {
          setRenameModalConversation(null);
          setRenameError(null);
        }}
        onChange={setRenameTitle}
        onSubmit={() => {
          void submitRenameConversation();
        }}
      />

      <AssistantConversationDeleteDialog
        open={deleteModalConversation !== null}
        title={deleteModalConversation?.title ?? "Nueva conversacion"}
        error={deleteError}
        isSaving={isDeleteSaving}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalConversation(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => {
          void submitDeleteConversation();
        }}
      />
    </section>
  );
}
