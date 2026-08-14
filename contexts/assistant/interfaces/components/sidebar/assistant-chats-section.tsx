"use client";

import { ChevronDown } from "lucide-react";

import { SidebarMenuButton } from "@/contexts/shared/interfaces/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
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
    mutatingConversationId,
    openDeleteConversation,
    openRenameConversation,
    renameError,
    renameModalConversation,
    renameTitle,
    sectionRef,
    setDeleteError,
    setDeleteModalConversation,
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
              mutatingConversationId={mutatingConversationId}
              establishmentId={establishmentId}
              onRename={openRenameConversation}
              onDelete={openDeleteConversation}
            />
          </div>
        </div>
      ) : null}

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
