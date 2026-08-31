"use client";

import { ChevronDown } from "lucide-react";

import { SidebarMenuButton } from "@/contexts/shared/interfaces/components/ui/sidebar";
import { ScrollArea, ScrollBar } from "@/contexts/shared/interfaces/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { AssistantConversationDeleteDialog } from "./assistant-conversation-delete-dialog";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantConversationRenameModal } from "./assistant-conversation-rename-modal";
import { useAssistantConversationSidebar } from "./use-assistant-conversation-sidebar";

export function AssistantChatsSection({
  className,
  initialConversations,
  establishmentId,
}: {
  className?: string;
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
    <section
      ref={sectionRef}
      className={cn("mt-2 flex min-h-0 flex-1 flex-col", className)}
    >
      <SidebarMenuButton
        type="button"
        onClick={toggleOpen}
        className="h-(--app-sidebar-control-height) shrink-0 justify-between rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-sm font-medium"
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
        <div className="min-h-0 flex-1 pl-2">
          <ScrollArea className="h-full min-h-0 pr-1">
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
            <ScrollBar className="opacity-0" />
          </ScrollArea>
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
