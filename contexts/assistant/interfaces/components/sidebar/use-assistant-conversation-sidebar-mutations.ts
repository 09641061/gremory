"use client";

import { useState } from "react";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import {
  deleteAssistantConversationAction,
  renameAssistantConversationAction,
} from "@/contexts/assistant/interfaces/actions/assistant-conversation.actions";

import {
  dispatchAssistantConversationMutation,
} from "./assistant-conversation-mutation.events";

export function useAssistantConversationSidebarMutations() {
  const [mutatingConversationId, setMutatingConversationId] = useState<string | null>(null);
  const [renameModalConversation, setRenameModalConversation] =
    useState<AssistantConversationSummaryReadModel | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const [deleteModalConversation, setDeleteModalConversation] =
    useState<AssistantConversationSummaryReadModel | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSaving, setIsDeleteSaving] = useState(false);

  function openRenameConversation(conversation: AssistantConversationSummaryReadModel) {
    setRenameModalConversation(conversation);
    setRenameTitle(conversation.title);
    setRenameError(null);
  }

  async function submitRenameConversation() {
    if (!renameModalConversation || isRenameSaving) return;

    const nextTitle = renameTitle.trim();

    if (!nextTitle) {
      setRenameError("The name cannot be empty.");
      return;
    }

    if (nextTitle.length > 200) {
      setRenameError("The name cannot exceed 200 characters.");
      return;
    }

    setIsRenameSaving(true);
    setRenameError(null);
    setMutatingConversationId(renameModalConversation.id);

    try {
      const result = await renameAssistantConversationAction({
        id: renameModalConversation.id,
        title: nextTitle,
      });

      if (result.status === "error") {
        setRenameError(result.error);
        return;
      }

      dispatchAssistantConversationMutation({
        type: "rename",
        conversationId: renameModalConversation.id,
        title: result.data.title,
      });
      setRenameModalConversation(null);
    } catch (requestError) {
      setRenameError(
        requestError instanceof Error ? requestError.message : "We couldn't rename the chat.",
      );
    } finally {
      setIsRenameSaving(false);
      setMutatingConversationId(null);
    }
  }

  function openDeleteConversation(conversation: AssistantConversationSummaryReadModel) {
    setDeleteModalConversation(conversation);
    setDeleteError(null);
  }

  async function confirmDeleteConversation() {
    if (!deleteModalConversation || isDeleteSaving) return;

    setIsDeleteSaving(true);
    setDeleteError(null);
    setMutatingConversationId(deleteModalConversation.id);

    try {
      const result = await deleteAssistantConversationAction({
        id: deleteModalConversation.id,
      });

      if (result.status === "error") {
        setDeleteError(result.error);
        return;
      }

      dispatchAssistantConversationMutation({
        type: "delete",
        conversationId: deleteModalConversation.id,
      });
      setDeleteModalConversation(null);
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error ? requestError.message : "We couldn't delete the chat.",
      );
    } finally {
      setIsDeleteSaving(false);
      setMutatingConversationId(null);
    }
  }

  return {
    deleteError,
    deleteModalConversation,
    error: null,
    isDeleteSaving,
    isLoading: false,
    isRenameSaving,
    mutatingConversationId,
    openDeleteConversation,
    openRenameConversation,
    renameError,
    renameModalConversation,
    renameTitle,
    setDeleteError,
    setDeleteModalConversation,
    setRenameError,
    setRenameModalConversation,
    setRenameTitle,
    submitDeleteConversation: confirmDeleteConversation,
    submitRenameConversation,
  };
}
