"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { submitAssistantMessageAction } from "@/contexts/assistant/interfaces/actions/assistant-chat.actions";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

import { AssistantChatComposer } from "./assistant-chat-composer";
import { AssistantChatEmptyState } from "./assistant-chat-empty-state";
import { AssistantChatThread } from "./assistant-chat-thread";

function buildConversationUrl(conversationId?: string | null) {
  if (!conversationId) return "/chat";

  const params = new URLSearchParams();
  params.set("conversationId", conversationId);
  return `/chat?${params.toString()}`;
}

type AssistantChatViewProps = {
  conversationId: string | null;
  initialConversation: AssistantConversationReadModel | null;
  hasAssistantAccess: boolean;
};

export function AssistantChatView({
  conversationId,
  initialConversation,
  hasAssistantAccess,
}: AssistantChatViewProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [activeConversation, setActiveConversation] = useState<AssistantConversationReadModel | null>(
    initialConversation,
  );
  const [pendingConversation, setPendingConversation] = useState<AssistantConversationReadModel | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visibleConversation = activeConversation ?? pendingConversation;
  const isThreadVisible = Boolean(conversationId || visibleConversation);

  useEffect(() => {
    function handleConversationMutation(event: Event) {
      const customEvent = event as CustomEvent<
        | { type: "upsert"; conversation: AssistantConversationReadModel; moveToFront?: boolean }
        | { type: "rename"; conversationId: string; title: string }
        | { type: "delete"; conversationId: string }
      >;

      const detail = customEvent.detail;
      if (!detail || !conversationId) return;

      switch (detail.type) {
        case "upsert":
          if (detail.conversation.id === conversationId) {
            setActiveConversation(detail.conversation);
          }
          return;
        case "rename":
          if (detail.conversationId !== conversationId) {
            return;
          }

          setActiveConversation((current) =>
            current && current.id === detail.conversationId ? { ...current, title: detail.title } : current,
          );
          return;
        case "delete":
          if (detail.conversationId !== conversationId) {
            return;
          }

          setActiveConversation(null);
          return;
      }
    }

    window.addEventListener("assistant-conversations-updated", handleConversationMutation);
    return () =>
      window.removeEventListener("assistant-conversations-updated", handleConversationMutation);
  }, [conversationId]);

  async function sendMessage() {
    const message = draft.trim();

    if (!hasAssistantAccess || !message || isSendingMessage) return;

    setIsSendingMessage(true);
    setError(null);
    setDraft("");

    if (!conversationId) {
      const now = new Date().toISOString();
      setPendingConversation({
        id: "pending-conversation",
        title: "Nuevo chat",
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `pending-message-${now}`,
            role: "user",
            content: message,
            createdAt: now,
          },
        ],
      });
    }

    try {
      const result = await submitAssistantMessageAction({
        conversationId,
        message,
      });

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      window.dispatchEvent(
        new CustomEvent("assistant-conversations-updated", {
          detail: { type: "upsert", conversation: result.data, moveToFront: true },
        }),
      );
      setPendingConversation(null);
      setActiveConversation(result.data);
      router.replace(buildConversationUrl(result.data.id), { scroll: false });
    } catch (requestError) {
      setDraft(message);
      setPendingConversation(null);
      setError(
        requestError instanceof Error ? requestError.message : "Could not send the message.",
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
      {isThreadVisible ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <AssistantChatThread
            conversation={visibleConversation}
            isLoading={false}
            isAssistantThinking={isSendingMessage}
            bottomRef={bottomRef}
            showWelcome={Boolean(conversationId)}
            error={
              !hasAssistantAccess
                ? "You do not have active access to the assistant. Check your session or subscription."
                : error
            }
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="pointer-events-auto w-full max-w-4xl">
              <AssistantChatComposer
                value={draft}
                isSending={isSendingMessage || !hasAssistantAccess}
                onValueChange={setDraft}
                onSubmit={() => {
                  void sendMessage();
                }}
                onKeyDown={handleComposerKeyDown}
                disabled={!hasAssistantAccess}
                floating
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col justify-center">
          <AssistantChatEmptyState />
          <div className="h-8 sm:h-10" />
          <AssistantChatComposer
            value={draft}
            isSending={isSendingMessage || !hasAssistantAccess}
            onValueChange={setDraft}
            onSubmit={() => {
              void sendMessage();
            }}
            onKeyDown={handleComposerKeyDown}
            disabled={!hasAssistantAccess}
            variant="minimal"
          />
        </div>
      )}

      <ErrorAlert
        title="Assistant error"
        message={
          !hasAssistantAccess
            ? "You do not have active access to the assistant. Check your session or subscription."
            : error ?? undefined
        }
      />
    </div>
  );
}
