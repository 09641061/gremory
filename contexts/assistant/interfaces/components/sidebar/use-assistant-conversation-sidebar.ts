"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/model/assistant.read-models";
import type { AssistantConversationSummary } from "@/contexts/assistant/interfaces/model/assistant-chat.read-models";
import {
  ensureAssistantConversationListCached,
  getAssistantConversationListCache,
  patchAssistantConversationListItemTitle,
  removeAssistantConversationListItem,
  setAssistantConversationListCache,
  upsertAssistantConversationListItem,
} from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-cache";

const assistantConversationsEndpoint = "/api/assistant/conversations";

type ConversationMutationEventDetail =
  | { type: "upsert"; conversation: AssistantConversationSummary; moveToFront?: boolean }
  | { type: "rename"; conversationId: string; title: string }
  | { type: "delete"; conversationId: string };

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = text ? (JSON.parse(text) as unknown) : undefined;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message?: unknown }).message ?? "")
        : "";
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return parsed as T;
}

export function useAssistantConversationSidebar(
  initialConversations: AssistantConversationSummaryReadModel[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const isOpen = manualOpen ?? pathname.startsWith("/chat");
  const [conversations, setConversations] = useState<AssistantConversationSummary[]>(
    () => initialConversations,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [mutatingConversationId, setMutatingConversationId] = useState<string | null>(null);
  const [renameModalConversation, setRenameModalConversation] =
    useState<AssistantConversationSummary | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const [deleteModalConversation, setDeleteModalConversation] =
    useState<AssistantConversationSummary | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteSaving, setIsDeleteSaving] = useState(false);

  useEffect(() => {
    setAssistantConversationListCache(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!sectionRef.current) return;
      if (menuRef.current && event.target instanceof Node && menuRef.current.contains(event.target)) {
        return;
      }
      if (event.target instanceof Node && sectionRef.current.contains(event.target)) return;
      setOpenMenuId(null);
      setMenuPosition(null);
    }

    if (openMenuId) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!openMenuId) return;

    function closeMenu() {
      setOpenMenuId(null);
      setMenuPosition(null);
    }

    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!isOpen) return;

    const cached = getAssistantConversationListCache();

    queueMicrotask(() => {
      setConversations(cached.conversations);
      setError(cached.error);
      setIsLoading(!cached.loaded);
    });

    if (cached.loaded) return;

    const controller = new AbortController();

    void ensureAssistantConversationListCached()
      .then((data) => {
        if (controller.signal.aborted) return;
        setConversations(data);
        setError(null);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setConversations([]);
        setError(
          requestError instanceof Error ? requestError.message : "No pudimos cargar los chats.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          const nextCache = getAssistantConversationListCache();
          setIsLoading(nextCache.isLoading);
        }
      });

    return () => controller.abort();
  }, [isOpen]);

  useEffect(() => {
    function handleMutation(event: Event) {
      const customEvent = event as CustomEvent<ConversationMutationEventDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      switch (detail.type) {
        case "upsert": {
          upsertAssistantConversationListItem(detail.conversation, {
            moveToFront: detail.moveToFront,
          });
          setConversations((current) => {
            const next = current.filter((item) => item.id !== detail.conversation.id);
            return detail.moveToFront
              ? [detail.conversation, ...next]
              : [...next, detail.conversation];
          });
          return;
        }
        case "rename": {
          const { title } = detail;
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === detail.conversationId ? { ...conversation, title } : conversation,
            ),
          );
          patchAssistantConversationListItemTitle(detail.conversationId, title);
          return;
        }
        case "delete": {
          setConversations((current) =>
            current.filter((conversation) => conversation.id !== detail.conversationId),
          );
          removeAssistantConversationListItem(detail.conversationId);
          if (detail.conversationId === activeConversationId) {
            router.replace("/chat", { scroll: false });
          }
          return;
        }
      }
    }

    window.addEventListener("assistant-conversations-updated", handleMutation);
    return () => window.removeEventListener("assistant-conversations-updated", handleMutation);
  }, [activeConversationId, router]);

  function openRenameConversation(conversation: AssistantConversationSummary) {
    setRenameModalConversation(conversation);
    setRenameTitle(conversation.title);
    setRenameError(null);
    setOpenMenuId(null);
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
    setError(null);

    try {
      const updated = await requestJson<AssistantConversationSummary>(
        `${assistantConversationsEndpoint}/${encodeURIComponent(renameModalConversation.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title: nextTitle }),
        },
      );

      setConversations((current) =>
        current.map((item) => (item.id === renameModalConversation.id ? updated : item)),
      );
      patchAssistantConversationListItemTitle(renameModalConversation.id, updated.title);

      window.dispatchEvent(
        new CustomEvent<ConversationMutationEventDetail>("assistant-conversations-updated", {
          detail: {
            type: "rename",
            conversationId: renameModalConversation.id,
            title: updated.title,
          },
        }),
      );
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

  function openDeleteConversation(conversation: AssistantConversationSummary) {
    setDeleteModalConversation(conversation);
    setDeleteError(null);
    setOpenMenuId(null);
    setMenuPosition(null);
  }

  async function confirmDeleteConversation() {
    if (!deleteModalConversation || isDeleteSaving) return;

    setIsDeleteSaving(true);
    setDeleteError(null);
    setMutatingConversationId(deleteModalConversation.id);
    setError(null);

    try {
      await requestJson<void>(
        `${assistantConversationsEndpoint}/${encodeURIComponent(deleteModalConversation.id)}`,
        {
          method: "DELETE",
        },
      );

      setConversations((current) =>
        current.filter((item) => item.id !== deleteModalConversation.id),
      );
      removeAssistantConversationListItem(deleteModalConversation.id);
      window.dispatchEvent(
        new CustomEvent<ConversationMutationEventDetail>("assistant-conversations-updated", {
          detail: { type: "delete", conversationId: deleteModalConversation.id },
        }),
      );
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

  function toggleOpen() {
    setManualOpen((current) => {
      const nextValue = current ?? pathname.startsWith("/chat");
      return !nextValue;
    });
  }

  return {
    activeConversationId,
    conversations,
    deleteError,
    deleteModalConversation,
    error,
    isDeleteSaving,
    isLoading,
    isOpen,
    isRenameSaving,
    manualOpen,
    menuPosition,
    menuRef,
    mutatingConversationId,
    openConversation: openMenuId
      ? conversations.find((conversation) => conversation.id === openMenuId) ?? null
      : null,
    openMenuId,
    openDeleteConversation,
    openRenameConversation,
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
    submitDeleteConversation: confirmDeleteConversation,
    submitRenameConversation,
    toggleOpen,
  };
}
