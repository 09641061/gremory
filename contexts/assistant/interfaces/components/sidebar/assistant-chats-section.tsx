"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import type {
  AssistantConversationSummary,
} from "@/contexts/assistant/interfaces/components/shared/assistant-chat.types";
import {
  ensureAssistantConversationListCached,
  getAssistantConversationListCache,
  patchAssistantConversationListItemTitle,
  removeAssistantConversationListItem,
  upsertAssistantConversationListItem,
} from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-cache";
import { AssistantConversationActionsMenu } from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-actions-menu";
import { AssistantConversationDeleteDialog } from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-delete-dialog";
import { AssistantConversationListItem } from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-list-item";
import { AssistantConversationRenameModal } from "@/contexts/assistant/interfaces/components/sidebar/assistant-conversation-rename-modal";
import { cn } from "@/lib/utils";

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

export function AssistantChatsSection() {
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
  const [conversations, setConversations] = useState<AssistantConversationSummary[]>([]);
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

  const openConversation = openMenuId
    ? conversations.find((conversation) => conversation.id === openMenuId) ?? null
    : null;

  return (
    <section ref={sectionRef} className="mt-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() =>
          setManualOpen((current) => {
            const nextValue = current ?? pathname.startsWith("/chat");
            return !nextValue;
          })
        }
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
            {isLoading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-md bg-muted/40" />
                ))}
              </div>
            ) : error ? (
              <p className="rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
                {error}
              </p>
            ) : conversations.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
                No chats yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;
                  const isMutating = mutatingConversationId === conversation.id;

                  return (
                    <AssistantConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      active={active}
                      isMutating={isMutating}
                      isMenuOpen={openMenuId === conversation.id}
                      onOpenMenu={(nextConversation, nextMenuPosition) => {
                        setMenuPosition((current) =>
                          current && openMenuId === nextConversation.id ? null : nextMenuPosition,
                        );
                        setOpenMenuId((current) =>
                          current === nextConversation.id ? null : nextConversation.id,
                        );
                      }}
                    />
                  );
                })}
              </ul>
            )}
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
        conversationTitle={renameModalConversation?.title ?? ""}
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
        title={deleteModalConversation?.title ?? ""}
        error={deleteError}
        isSaving={isDeleteSaving}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalConversation(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => {
          void confirmDeleteConversation();
        }}
      />
    </section>
  );
}
