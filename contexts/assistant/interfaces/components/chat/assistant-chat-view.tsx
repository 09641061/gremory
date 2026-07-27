"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import type { SubscriptionResponse } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";

import { AssistantChatComposer } from "./assistant-chat-composer";
import { AssistantChatThread } from "./assistant-chat-thread";
import {
  upsertAssistantConversationListItem,
} from "./assistant-conversation-cache";
import type { AssistantChatMessage, AssistantConversation } from "./assistant-chat.types";

const conversationsEndpoint = "/api/assistant/conversations";
const subscriptionStatusEndpoint = "/api/billing/subscriptions";

function normalizeMessage(message: {
  id: string;
  role: string;
  content: string;
  intent?: string | null;
  createdAt: string;
}): AssistantChatMessage {
  return {
    id: message.id,
    role: message.role.toUpperCase() === "ASSISTANT" ? "assistant" : "user",
    content: message.content,
    intent: message.intent ?? null,
    createdAt: message.createdAt,
  };
}

function normalizeConversation(raw: {
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
}): AssistantConversation {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastMessageAt: raw.lastMessageAt ?? null,
    messageCount: raw.messages.length,
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

export function AssistantChatView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [activeConversation, setActiveConversation] = useState<AssistantConversation | null>(null);
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
            : "No pudimos cargar la conversación seleccionada.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingConversation(false);
        }
      }
    };

    void loadConversation();

    return () => controller.abort();
  }, [assistantAccessState, selectedConversationId]);

  useEffect(() => {
    function handleConversationMutation(event: Event) {
      const customEvent = event as CustomEvent<
        | { type: "upsert"; conversation: AssistantConversation; moveToFront?: boolean }
        | { type: "rename"; conversationId: string; title: string }
        | { type: "delete"; conversationId: string }
      >;

      if (!customEvent.detail) return;

      if (customEvent.detail.type === "upsert") {
        if (
          selectedConversationId &&
          customEvent.detail.conversation.id === selectedConversationId
        ) {
          setActiveConversation(customEvent.detail.conversation);
        }
        return;
      }

      if (!selectedConversationId || customEvent.detail.conversationId !== selectedConversationId) {
        return;
      }

      if (customEvent.detail.type === "rename") {
        setActiveConversation((current) =>
          current && current.id === customEvent.detail.conversationId
            ? { ...current, title: customEvent.detail.title }
            : current,
        );
      }

      if (customEvent.detail.type === "delete") {
        setActiveConversation(null);
      }
    }

    window.addEventListener("assistant-conversations-updated", handleConversationMutation);
    return () =>
      window.removeEventListener("assistant-conversations-updated", handleConversationMutation);
  }, [selectedConversationId]);

  async function createConversationRecord(title: string) {
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
      }>(conversationsEndpoint, {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    const conversation = normalizeConversation(data);
    upsertAssistantConversationListItem(conversation, { moveToFront: true });
    window.dispatchEvent(
      new CustomEvent("assistant-conversations-updated", {
        detail: { type: "upsert", conversation, moveToFront: true },
      }),
    );

    return conversation;
  }

  async function sendMessage() {
    const message = draft.trim();

    if (assistantAccessState !== "ready" || !message || isSendingMessage) return;

    setIsSendingMessage(true);
    setError(null);

    try {
      let conversationId = selectedConversationId;

      if (!conversationId) {
        const createdConversation = await createConversationRecord("Nuevo chat");
        conversationId = createdConversation.id;
        setActiveConversation(createdConversation);
        router.replace(buildConversationUrl(pathname, conversationId), { scroll: false });
      }

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
      }>(`${conversationsEndpoint}/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      const conversation = normalizeConversation(data);
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
          : "No pudimos enviar el mensaje.",
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
      <AssistantChatThread
        conversation={selectedConversationId ? activeConversation : null}
        isLoading={assistantAccessState === "checking" || isLoadingConversation}
        bottomRef={bottomRef}
        error={
          assistantAccessState === "blocked"
            ? "No hay acceso activo al asistente. Revisa tu sesión o suscripción."
            : error
        }
      />

      <AssistantChatComposer
        value={draft}
        isSending={isSendingMessage || assistantAccessState !== "ready"}
        onValueChange={setDraft}
        onSubmit={() => {
          void sendMessage();
        }}
        onKeyDown={handleComposerKeyDown}
        disabled={assistantAccessState !== "ready"}
      />
    </div>
  );
}
