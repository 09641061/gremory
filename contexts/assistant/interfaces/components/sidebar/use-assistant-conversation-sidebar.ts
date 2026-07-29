"use client";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

import { useAssistantConversationSidebarConversations } from "./use-assistant-conversation-sidebar-conversations";
import { useAssistantConversationSidebarMutations } from "./use-assistant-conversation-sidebar-mutations";
import { useAssistantConversationSidebarUI } from "./use-assistant-conversation-sidebar-ui";

export function useAssistantConversationSidebar(
  initialConversations: AssistantConversationSummaryReadModel[],
) {
  const ui = useAssistantConversationSidebarUI();
  const conversationState = useAssistantConversationSidebarConversations(
    initialConversations,
    ui.activeConversationId,
  );
  const mutations = useAssistantConversationSidebarMutations();

  const openConversation = ui.openMenuId
    ? conversationState.conversations.find((conversation) => conversation.id === ui.openMenuId) ?? null
    : null;

  return {
    activeConversationId: ui.activeConversationId,
    conversations: conversationState.conversations,
    deleteError: mutations.deleteError,
    deleteModalConversation: mutations.deleteModalConversation,
    error: mutations.error,
    isDeleteSaving: mutations.isDeleteSaving,
    isLoading: mutations.isLoading,
    isOpen: ui.isOpen,
    isRenameSaving: mutations.isRenameSaving,
    manualOpen: ui.manualOpen,
    menuPosition: ui.menuPosition,
    menuRef: ui.menuRef,
    mutatingConversationId: mutations.mutatingConversationId,
    openConversation,
    openMenuId: ui.openMenuId,
    openDeleteConversation: mutations.openDeleteConversation,
    openRenameConversation: mutations.openRenameConversation,
    renameError: mutations.renameError,
    renameModalConversation: mutations.renameModalConversation,
    renameTitle: mutations.renameTitle,
    sectionRef: ui.sectionRef,
    setDeleteError: mutations.setDeleteError,
    setDeleteModalConversation: mutations.setDeleteModalConversation,
    setMenuPosition: ui.setMenuPosition,
    setOpenMenuId: ui.setOpenMenuId,
    setRenameError: mutations.setRenameError,
    setRenameModalConversation: mutations.setRenameModalConversation,
    setRenameTitle: mutations.setRenameTitle,
    submitDeleteConversation: mutations.submitDeleteConversation,
    submitRenameConversation: mutations.submitRenameConversation,
    toggleOpen: ui.toggleOpen,
  };
}
