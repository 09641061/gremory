"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  MessageSquareText,
  MoreHorizontal,
  PencilLine,
  Trash2,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
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

function RenameConversationModal({
  open,
  conversationTitle,
  value,
  error,
  isSaving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  conversationTitle: string;
  value: string;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-conversation-title"
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Chat
              </p>
              <h2 id="rename-conversation-title" className="mt-1 text-lg font-semibold">
                Editar nombre
              </h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label htmlFor="conversation-title" className="text-sm font-medium">
                Nombre del chat
              </label>
              <Input
                ref={inputRef}
                id="conversation-title"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={conversationTitle}
                maxLength={200}
                disabled={isSaving}
                className="h-10"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSaving || !value.trim() || value.trim().length > 200}
              className="gap-2"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
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
      setRenameError("El nombre no puede estar vacio.");
      return;
    }

    if (nextTitle.length > 200) {
      setRenameError("El nombre no puede superar 200 caracteres.");
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
        requestError instanceof Error ? requestError.message : "No pudimos renombrar el chat.",
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
        requestError instanceof Error ? requestError.message : "No pudimos eliminar el chat.",
      );
    } finally {
      setIsDeleteSaving(false);
      setMutatingConversationId(null);
    }
  }

  return (
    <section ref={sectionRef} className="mt-2">
      <div className="my-2 border-t border-border/60" />

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
        <span className="flex items-center gap-2.5">
          <MessageSquareText className="size-5 text-muted-foreground" strokeWidth={2} />
          <span>Chats</span>
        </span>
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
                No hay chats todavia.
              </p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;
                  const isMutating = mutatingConversationId === conversation.id;

                  return (
                    <li key={conversation.id}>
                      <div className="relative flex items-center gap-1.5 rounded-2xl">
                        <Link
                          href={`/chat?conversationId=${encodeURIComponent(conversation.id)}`}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "lg" }),
                            "min-w-0 flex-1 justify-start gap-2.5 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-foreground hover:border-accent/40 hover:bg-accent/70 hover:text-accent-foreground",
                            active &&
                              "!border-accent/40 !bg-accent !text-accent-foreground hover:!border-accent/40 hover:!bg-accent hover:!text-accent-foreground",
                          )}
                        >
                          <span className="truncate">{conversation.title}</span>
                        </Link>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          disabled={isMutating}
                          aria-label={`Opciones para ${conversation.title}`}
                          aria-expanded={openMenuId === conversation.id}
                          onClick={(event) => {
                            const currentTarget = event.currentTarget;
                            const rect = currentTarget.getBoundingClientRect();
                            const estimatedMenuHeight = 116;
                            const estimatedMenuWidth = 176;
                            const top = Math.max(8, rect.top - estimatedMenuHeight - 8);
                            const left = Math.max(
                              8,
                              Math.min(rect.right - estimatedMenuWidth, window.innerWidth - estimatedMenuWidth - 8),
                            );

                            setMenuPosition((current) =>
                              current && openMenuId === conversation.id ? null : { top, left },
                            );
                            setOpenMenuId((current) =>
                              current === conversation.id ? null : conversation.id,
                            );
                          }}
                          className={cn(
                            "shrink-0 rounded-full border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                            openMenuId === conversation.id && "bg-muted text-foreground",
                          )}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>

                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {openMenuId && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[60] w-44 rounded-2xl border border-border/70 bg-background p-1.5 shadow-xl shadow-black/20"
              style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
            >
              {(() => {
                const conversation = conversations.find((item) => item.id === openMenuId);
                if (!conversation) return null;
                const isMutating = mutatingConversationId === conversation.id;

                return (
                  <>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => {
                        openRenameConversation(conversation);
                        setMenuPosition(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <PencilLine className="size-4 text-muted-foreground" />
                      <span>Editar nombre</span>
                    </button>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => {
                        openDeleteConversation(conversation);
                        setMenuPosition(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                      <span>Eliminar</span>
                    </button>
                  </>
                );
              })()}
            </div>,
            document.body,
          )
        : null}

      <RenameConversationModal
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

      <AlertDialog
        open={deleteModalConversation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalConversation(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar conversacion?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer.
              <span className="mt-1 block font-medium text-foreground">
                {deleteModalConversation?.title ?? ""}
              </span>
            </AlertDialogDescription>
            {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteSaving}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleteSaving}
              onClick={() => {
                void confirmDeleteConversation();
              }}
            >
              {isDeleteSaving ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
