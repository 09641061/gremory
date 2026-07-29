"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import type { SubscriptionResponse } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { submitAssistantMessageAction } from "@/contexts/assistant/interfaces/actions/assistant-chat.actions";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import type {
  AssistantConversationReadModel,
  AssistantMessageReadModel,
} from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

import { AssistantChatEmptyState } from "./assistant-chat-empty-state";
import { AssistantChatComposer } from "./assistant-chat-composer";
import { AssistantChatThread } from "./assistant-chat-thread";
import { upsertAssistantConversationListItem } from "../sidebar/assistant-conversation-cache";

const conversationsEndpoint = "/api/assistant/conversations";
const subscriptionStatusEndpoint = "/api/billing/subscriptions";

function normalizeMessage(message: {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}): AssistantMessageReadModel {
  const role = (message.role ?? "").toUpperCase();

  return {
    id: message.id,
    role: role === "ASSISTANT" || role === "AGENT" ? "assistant" : "user",
    content: message.content,
    createdAt: message.createdAt,
  };
}

function normalizeConversation(raw: {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
}): AssistantConversationReadModel {
  return {
    id: raw.id,
    title: raw.title,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    messages: raw.messages.map(normalizeMessage),
  };
}

function extractErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

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
    throw new Error(extractErrorMessage(parsed, `Request failed with status ${response.status}`));
  }

  return parsed as T;
}

function buildConversationUrl(pathname: string, conversationId?: string | null) {
  if (!conversationId) return pathname;

  const params = new URLSearchParams();
  params.set("conversationId", conversationId);
  return `${pathname}?${params.toString()}`;
}

type AssistantChatViewProps = {
  initialConversation: AssistantConversationReadModel | null;
};

export function AssistantChatView({ initialConversation }: AssistantChatViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [activeConversation, setActiveConversation] = useState<AssistantConversationReadModel | null>(
    initialConversation,
  );
  const [draft, setDraft] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [assistantAccessState, setAssistantAccessState] = useState<
    "checking" | "ready" | "blocked"
  >("checking");
  const [error, setError] = useState<string | null>(null);

  const selectedConversationId = searchParams.get("conversationId");

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const response = await fetch(subscriptionStatusEndpoint, { cache: "no-store" });
        const subscription = response.ok
          ? ((await response.json()) as SubscriptionResponse)
          : null;

        if (cancelled) return;
        setAssistantAccessState(hasActiveSubscription(subscription) ? "ready" : "blocked");
      } catch {
        if (!cancelled) {
          setAssistantAccessState("blocked");
        }
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages.length]);

  useEffect(() => {
    if (assistantAccessState !== "ready" || !selectedConversationId) return;
    if (activeConversation?.id === selectedConversationId) return;

    const controller = new AbortController();

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      setError(null);

      try {
        const data = await requestJson<{
          id: string;
          title: string;
          status: string;
          createdAt: string;
          updatedAt: string;
          lastMessageAt?: string | null;
          messages: Array<{
            id: string;
            role: string;
            content: string;
            intent?: string | null;
            createdAt: string;
          }>;
        }>(`${conversationsEndpoint}/${encodeURIComponent(selectedConversationId)}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setActiveConversation(normalizeConversation(data));
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setActiveConversation(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load the selected conversation.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingConversation(false);
        }
      }
    };

    void loadConversation();

    return () => controller.abort();
  }, [assistantAccessState, selectedConversationId, activeConversation?.id]);

  useEffect(() => {
    function handleConversationMutation(event: Event) {
      const customEvent = event as CustomEvent<
        | { type: "upsert"; conversation: AssistantConversationReadModel; moveToFront?: boolean }
        | { type: "rename"; conversationId: string; title: string }
        | { type: "delete"; conversationId: string }
      >;

      const detail = customEvent.detail;
      if (!detail) return;

      switch (detail.type) {
        case "upsert":
          if (selectedConversationId && detail.conversation.id === selectedConversationId) {
            setActiveConversation(detail.conversation);
          }
          return;
        case "rename":
          if (!selectedConversationId || detail.conversationId !== selectedConversationId) {
            return;
          }

          setActiveConversation((current) =>
            current && current.id === detail.conversationId ? { ...current, title: detail.title } : current,
          );
          return;
        case "delete":
          if (!selectedConversationId || detail.conversationId !== selectedConversationId) {
            return;
          }

          setActiveConversation(null);
          return;
      }
    }

    window.addEventListener("assistant-conversations-updated", handleConversationMutation);
    return () =>
      window.removeEventListener("assistant-conversations-updated", handleConversationMutation);
  }, [selectedConversationId]);

  async function sendMessage() {
    const message = draft.trim();

    if (assistantAccessState !== "ready" || !message || isSendingMessage) return;

    setIsSendingMessage(true);
    setError(null);

    try {
      const result = await submitAssistantMessageAction({
        conversationId: selectedConversationId,
        message,
      });

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      const conversation = normalizeConversation(result.data);
      upsertAssistantConversationListItem(conversation, { moveToFront: true });
      window.dispatchEvent(
        new CustomEvent("assistant-conversations-updated", {
          detail: { type: "upsert", conversation, moveToFront: true },
        }),
      );
      setDraft("");
      setActiveConversation(conversation);
      router.replace(buildConversationUrl(pathname, conversation.id), { scroll: false });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send the message.",
      );
    } finally {
      setIsSendingMessage(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      {selectedConversationId ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <AssistantChatThread
            conversation={activeConversation}
            isLoading={assistantAccessState === "checking" || isLoadingConversation}
            bottomRef={bottomRef}
            error={
              assistantAccessState === "blocked"
                ? "You do not have active access to the assistant. Check your session or subscription."
                : error
            }
            composer={
              <AssistantChatComposer
                value={draft}
                isSending={isSendingMessage || assistantAccessState !== "ready"}
                onValueChange={setDraft}
                onSubmit={() => {
                  void sendMessage();
                }}
                onKeyDown={handleComposerKeyDown}
                disabled={assistantAccessState !== "ready"}
                floating
              />
            }
          />
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col justify-center">
          <AssistantChatEmptyState />
          <div className="h-8 sm:h-10" />
          <AssistantChatComposer
            value={draft}
            isSending={isSendingMessage || assistantAccessState !== "ready"}
            onValueChange={setDraft}
            onSubmit={() => {
              void sendMessage();
            }}
            onKeyDown={handleComposerKeyDown}
            disabled={assistantAccessState !== "ready"}
            variant="minimal"
          />
        </div>
      )}

      <ErrorAlert
        title="Assistant error"
        message={
          assistantAccessState === "blocked"
            ? "You do not have active access to the assistant. Check your session or subscription."
            : error ?? undefined
        }
      />
    </div>
  );
}
