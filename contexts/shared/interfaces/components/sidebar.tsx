"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ContactRound,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Package,
  PencilLine,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import type {
  AssistantConversationPage,
  AssistantConversationSummary,
} from "@/contexts/assistant/interfaces/components/chat/assistant-chat.types";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "New Chat", href: "/chat", icon: MessageCircle },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "CRM", href: "/crm", icon: ContactRound },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const assistantConversationsEndpoint = "/api/assistant/conversations";

type ConversationMutationEventDetail =
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

function ChatsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement | null>(null);
  const activeConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const isOpen = manualOpen ?? pathname.startsWith("/chat");
  const [conversations, setConversations] = useState<AssistantConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mutatingConversationId, setMutatingConversationId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!sectionRef.current) return;
      if (event.target instanceof Node && sectionRef.current.contains(event.target)) return;
      setOpenMenuId(null);
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
    if (!isOpen) return;

    const controller = new AbortController();

    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await requestJson<AssistantConversationPage>(
          `${assistantConversationsEndpoint}?page=0&size=20`,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;
        setConversations(data.content ?? []);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setConversations([]);
        setError(
          requestError instanceof Error ? requestError.message : "No pudimos cargar los chats.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadConversations();

    return () => controller.abort();
  }, [isOpen, refreshToken]);

  useEffect(() => {
    function handleMutation(event: Event) {
      const customEvent = event as CustomEvent<ConversationMutationEventDetail>;
      if (!customEvent.detail || !activeConversationId) return;

      if (
        customEvent.detail.type === "rename" &&
        customEvent.detail.conversationId === activeConversationId
      ) {
        const { title } = customEvent.detail;
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === customEvent.detail.conversationId
              ? { ...conversation, title }
              : conversation,
          ),
        );
      }

      if (
        customEvent.detail.type === "delete" &&
        customEvent.detail.conversationId === activeConversationId
      ) {
        router.replace("/chat", { scroll: false });
      }
    }

    window.addEventListener("assistant-conversations-updated", handleMutation);
    return () => window.removeEventListener("assistant-conversations-updated", handleMutation);
  }, [activeConversationId, router]);

  async function renameConversation(conversation: AssistantConversationSummary) {
    const nextTitle = window.prompt("Nuevo nombre del chat", conversation.title)?.trim();

    if (!nextTitle || nextTitle === conversation.title) return;
    if (nextTitle.length > 200) {
      setError("El nombre no puede superar 200 caracteres.");
      return;
    }

    setMutatingConversationId(conversation.id);
    setError(null);

    try {
      const updated = await requestJson<AssistantConversationSummary>(
        `${assistantConversationsEndpoint}/${encodeURIComponent(conversation.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title: nextTitle }),
        },
      );

      setConversations((current) =>
        current.map((item) => (item.id === conversation.id ? updated : item)),
      );

      window.dispatchEvent(
        new CustomEvent<ConversationMutationEventDetail>("assistant-conversations-updated", {
          detail: { type: "rename", conversationId: conversation.id, title: updated.title },
        }),
      );
      setRefreshToken((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "No pudimos renombrar el chat.",
      );
    } finally {
      setMutatingConversationId(null);
      setOpenMenuId(null);
    }
  }

  async function deleteConversation(conversation: AssistantConversationSummary) {
    const confirmed = window.confirm(`Eliminar "${conversation.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setMutatingConversationId(conversation.id);
    setError(null);

    try {
      await requestJson<void>(
        `${assistantConversationsEndpoint}/${encodeURIComponent(conversation.id)}`,
        {
          method: "DELETE",
        },
      );

      setConversations((current) =>
        current.filter((item) => item.id !== conversation.id),
      );
      window.dispatchEvent(
        new CustomEvent<ConversationMutationEventDetail>("assistant-conversations-updated", {
          detail: { type: "delete", conversationId: conversation.id },
        }),
      );
      setRefreshToken((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "No pudimos eliminar el chat.",
      );
    } finally {
      setMutatingConversationId(null);
      setOpenMenuId(null);
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
        <div className="mt-2 space-y-2 pl-2">
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
                          "min-w-0 flex-1 justify-start gap-2.5 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-foreground hover:border-white/10 hover:bg-white/5 hover:text-white",
                          active && "border-white/10 bg-white/10 text-white",
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
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === conversation.id ? null : conversation.id,
                          )
                        }
                        className={cn(
                          "shrink-0 rounded-full border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                          openMenuId === conversation.id && "bg-muted text-foreground",
                        )}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>

                      {openMenuId === conversation.id ? (
                        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-30 w-44 rounded-2xl border border-border/70 bg-background p-1.5 shadow-xl shadow-black/10">
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => {
                              void renameConversation(conversation);
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
                              void deleteConversation(conversation);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            <Trash2 className="size-4 text-muted-foreground" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-60 shrink-0 border-r border-border/60 bg-background px-3 py-3 md:flex md:flex-col">
      <nav aria-label="Modulos" className="mt-2">
        <ul className="space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                    active && "!bg-accent !text-accent-foreground hover:!bg-accent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 text-muted-foreground",
                      active && "text-accent-foreground",
                    )}
                    strokeWidth={2}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ChatsSection />

      <nav aria-label="Configuracion" className="mt-auto pt-5">
        <ul>
          <li>
            <Link
              href="/settings"
              aria-current={
                pathname === "/settings" || pathname.startsWith("/settings/")
                  ? "page"
                  : undefined
              }
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                  "!bg-accent !text-accent-foreground hover:!bg-accent",
              )}
            >
              <Settings
                className={cn(
                  "size-5 text-muted-foreground",
                  (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                    "text-accent-foreground",
                )}
                strokeWidth={2}
              />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
