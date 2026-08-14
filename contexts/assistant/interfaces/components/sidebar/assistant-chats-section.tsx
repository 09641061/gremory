"use client";

import { ChevronDown } from "lucide-react";

import { SidebarMenuButton } from "@/contexts/shared/interfaces/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { AssistantConversationActionsMenu } from "./assistant-conversation-actions-menu";
import { AssistantConversationDeleteDialog } from "./assistant-conversation-delete-dialog";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantConversationRenameModal } from "./assistant-conversation-rename-modal";
import { useAssistantConversationSidebar } from "./use-assistant-conversation-sidebar";

export function AssistantChatsSection({
  initialConversations,
  establishmentId,
}: {
  initialConversations: AssistantConversationSummaryReadModel[];
  establishmentId: string | null;
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
      <SidebarMenuButton
        type="button"
        onClick={toggleOpen}
        className="h-(--app-sidebar-control-height) justify-between rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-sm font-medium"
        aria-expanded={isOpen}
      >
        <span>Chats</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </SidebarMenuButton>

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
              establishmentId={establishmentId}
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
        conversationTitle={renameModalConversation?.title ?? "New conversation"}
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
        title={deleteModalConversation?.title ?? "New conversation"}
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
