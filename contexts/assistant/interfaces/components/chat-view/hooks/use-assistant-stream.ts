import { useEffect, useState, type KeyboardEvent } from "react";
import type { useRouter } from "next/navigation";

import { getAssistantConversationAction } from "@/contexts/assistant/interfaces/actions/get-conversation.action";
import { submitAssistantMessageAction } from "@/contexts/assistant/interfaces/actions/assistant-chat.actions";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

function buildConversationUrl(conversationId?: string | null, establishmentId?: string | null) {
  if (!conversationId) return "/chat";

  const params = new URLSearchParams();
  params.set("conversationId", conversationId);
  if (establishmentId) {
    params.set("establishmentId", establishmentId);
  }
  return `/chat?${params.toString()}`;
}

type Router = ReturnType<typeof useRouter>;

interface UseAssistantStreamParams {
  conversationId: string | null;
  initialConversation: AssistantConversationViewModel | null;
  hasAssistantAccess: boolean;
  establishmentId: string | null;
  router: Router;
}

/**
 * Owns the assistant conversation state (active/pending), the message draft,
 * and the send flow — including the SSE streaming path and the traditional
 * synchronous fallback — plus cross-tab/cross-component sync via the
 * "assistant-conversations-updated" window event.
 */
export function useAssistantStream({
  conversationId,
  initialConversation,
  hasAssistantAccess,
  establishmentId,
  router,
}: UseAssistantStreamParams) {
  const [activeConversation, setActiveConversation] = useState<AssistantConversationViewModel | null>(
    initialConversation,
  );
  const [pendingConversation, setPendingConversation] = useState<AssistantConversationViewModel | null>(
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
        | { type: "upsert"; conversation: AssistantConversationViewModel; moveToFront?: boolean }
        | { type: "rename"; conversationId: string; title: string | null }
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
            current && current.id === detail.conversationId
              ? { ...current, title: detail.title ?? current.title }
              : current,
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
      let currentConvId = conversationId;

      // Si es un chat nuevo, debemos crearlo primero en el backend de forma síncrona
      if (!currentConvId) {
        const result = await submitAssistantMessageAction({
          conversationId: null,
          message,
          establishmentId,
        });

        if (result.status === "error") {
          setError(result.error);
          setPendingConversation(null);
          return;
        }

        currentConvId = result.data.id;
        window.dispatchEvent(
          new CustomEvent("assistant-conversations-updated", {
            detail: { type: "upsert", conversation: result.data, moveToFront: true },
          }),
        );
        setActiveConversation(result.data);
        setPendingConversation(null);
        router.replace(buildConversationUrl(currentConvId, establishmentId), { scroll: false });
        setIsSendingMessage(false);
        return;
      }

      // Si el streaming está activo, consumimos vía fetch SSE
      const isStreamingEnabled = process.env.NEXT_PUBLIC_ASSISTANT_STREAMING === "true";
      if (isStreamingEnabled && currentConvId) {
        // Añadimos el mensaje del usuario localmente primero
        const userMsgNow = new Date().toISOString();
        const updatedMessagesWithUser = [
          ...(activeConversation?.messages ?? []),
          {
            id: `user-msg-${userMsgNow}`,
            role: "user" as const,
            content: message,
            createdAt: userMsgNow,
          },
        ];

        // Añadimos burbuja temporal para la respuesta del asistente (thinking/vacia)
        const agentMsgNow = new Date().toISOString();
        const placeholderAgentMsg = {
          id: `agent-placeholder-${agentMsgNow}`,
          role: "assistant" as const,
          content: "Kodu is thinking...",
          createdAt: agentMsgNow,
        };

        const tempConversation = {
          ...activeConversation!,
          messages: [...updatedMessagesWithUser, placeholderAgentMsg],
        };

        setActiveConversation(tempConversation);

        const response = await fetch(`/api/assistant/conversations/${encodeURIComponent(currentConvId)}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, establishmentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message via streaming API");
        }

        if (!response.body) {
          throw new Error("No response body received from stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let finalResponseText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.replace("event:", "").trim();
            } else if (trimmed.startsWith("data:")) {
              const dataStr = trimmed.replace("data:", "").trim();
              if (currentEvent === "status") {
                // Actualiza la burbuja con el status del backend ("Generating response...")
                setActiveConversation((prev) => {
                  if (!prev) return null;
                  const messagesCopy = [...prev.messages];
                  if (messagesCopy.length > 0) {
                    messagesCopy[messagesCopy.length - 1] = {
                      ...messagesCopy[messagesCopy.length - 1],
                      content: dataStr,
                    };
                  }
                  return { ...prev, messages: messagesCopy };
                });
              } else if (currentEvent === "message") {
                // El backend retorna la respuesta completa en el evento 'message'
                finalResponseText = dataStr;
              }
            }
          }
        }

        // Al finalizar la lectura del stream, refrescamos el chat entero desde el backend para sincronizar ids reales
        const nextConversation = await getAssistantConversationAction(currentConvId);
        if (nextConversation) {
          setActiveConversation(nextConversation);
          window.dispatchEvent(
            new CustomEvent("assistant-conversations-updated", {
              detail: { type: "upsert", conversation: nextConversation, moveToFront: true },
            }),
          );
        } else if (finalResponseText) {
          // Fallback local si falla la re-hidratación
          setActiveConversation((prev) => {
            if (!prev) return null;
            const messagesCopy = [...prev.messages];
            if (messagesCopy.length > 0) {
              messagesCopy[messagesCopy.length - 1] = {
                ...messagesCopy[messagesCopy.length - 1],
                content: finalResponseText,
              };
            }
            return { ...prev, messages: messagesCopy };
          });
        }
      } else {
        // Flujo síncrono tradicional
        const result = await submitAssistantMessageAction({
          conversationId: currentConvId,
          message,
          establishmentId,
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
      }
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

  return {
    activeConversation,
    setActiveConversation,
    pendingConversation,
    visibleConversation,
    isThreadVisible,
    draft,
    setDraft,
    isSendingMessage,
    error,
    sendMessage,
    handleComposerKeyDown,
  };
}
