"use client";

import * as React from "react";
import type {
  WhatsappConversationSummary,
  WhatsappConversationDetail,
  WhatsappMessageItem,
  WhatsappWsEvent,
  WhatsappConversationStatus,
} from "@/contexts/chat/application/models/whatsapp-chat";
import {
  getWhatsappConversationsAction,
  getWhatsappConversationDetailAction,
  takeoverWhatsappConversationAction,
  releaseWhatsappConversationAction,
  sendWhatsappMessageAction,
} from "@/contexts/chat/interfaces/actions/whatsapp-conversations.action";
import { useChatWhatsappSocket } from "./hooks/use-chat-whatsapp-socket";
import { ChatConversationList } from "./components/chat-conversation-list";
import { ChatMessageThread } from "./components/chat-message-thread";
import { ChatCustomerQuickProfile } from "./components/chat-customer-quick-profile";

export interface ChatWhatsappInboxViewProps {
  establishmentId: string;
  initialConversationId?: string | null;
  onOpenCustomerDetail?: (customerId: string) => void;
}

export function ChatWhatsappInboxView({
  establishmentId,
  initialConversationId,
  onOpenCustomerDetail,
}: ChatWhatsappInboxViewProps) {
  const [filter, setFilter] = React.useState<"NEEDS_ATTENTION" | "ALL">("ALL");
  const [search, setSearch] = React.useState("");
  const [conversations, setConversations] = React.useState<WhatsappConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
    initialConversationId ?? null,
  );
  const [detail, setDetail] = React.useState<WhatsappConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  const [messageText, setMessageText] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState(false);

  React.useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
      setFilter("ALL");
    }
  }, [initialConversationId]);

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWsEvent = React.useCallback((event: WhatsappWsEvent) => {
    if (event.type === "MESSAGE_RECEIVED") {
      const payload = event.payload as {
        conversationId: string;
        conversationStatus: WhatsappConversationStatus;
        unreadCount: number;
        summaryTag: string;
        message: WhatsappMessageItem;
      };

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === payload.conversationId);
        if (index >= 0) {
          const updated = [...prev];
          const current = updated[index];
          if (current) {
            updated[index] = {
              ...current,
              status: payload.conversationStatus,
              unreadCount: payload.unreadCount,
              summaryTag: payload.summaryTag,
              lastMessagePreview: payload.message.content,
              lastMessageAt: payload.message.createdAt,
            };
          }
          return updated;
        }
        return prev;
      });

      setDetail((currentDetail) => {
        if (currentDetail && currentDetail.conversation.id === payload.conversationId) {
          const messages = currentDetail.messages ?? [];
          const exists = messages.some((m) => m.id === payload.message.id);
          if (exists) return currentDetail;

          return {
            ...currentDetail,
            conversation: {
              ...currentDetail.conversation,
              status: payload.conversationStatus,
              summaryTag: payload.summaryTag,
            },
            messages: [...messages, payload.message],
          };
        }
        return currentDetail;
      });

      setTimeout(scrollToBottom, 100);
    } else if (event.type === "CONVERSATION_UPDATED") {
      const payload = event.payload as {
        conversationId: string;
        status: WhatsappConversationStatus;
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === payload.conversationId ? { ...c, status: payload.status } : c)),
      );

      setDetail((currentDetail) => {
        if (currentDetail && currentDetail.conversation.id === payload.conversationId) {
          return {
            ...currentDetail,
            conversation: {
              ...currentDetail.conversation,
              status: payload.status,
            },
          };
        }
        return currentDetail;
      });
    }
  }, []);

  const { isConnected } = useChatWhatsappSocket({
    establishmentId,
    onEvent: handleWsEvent,
  });

  React.useEffect(() => {
    let ignore = false;
    getWhatsappConversationsAction(establishmentId, filter, search).then((res) => {
      if (!ignore && res.status === "success" && res.data) {
        setConversations(res.data.content);
      }
    });
    return () => {
      ignore = true;
    };
  }, [establishmentId, filter, search]);

  const filteredConversations = React.useMemo(() => {
    if (!search.trim()) return conversations;
    const query = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const phoneMatch = c.contactPhone?.toLowerCase().includes(query);
      const nameMatch = c.contactDisplayName?.toLowerCase().includes(query);
      const customerMatch = c.customerName?.toLowerCase().includes(query);
      const previewMatch = c.lastMessagePreview?.toLowerCase().includes(query);
      return Boolean(phoneMatch || nameMatch || customerMatch || previewMatch);
    });
  }, [conversations, search]);

  React.useEffect(() => {
    if (filteredConversations.length > 0) {
      const exists = filteredConversations.some((c) => c.id === selectedConversationId);
      if (!selectedConversationId || !exists) {
        setSelectedConversationId(filteredConversations[0]?.id ?? null);
      }
    } else if (conversations.length > 0) {
      setSelectedConversationId(null);
    }
  }, [filteredConversations, selectedConversationId, conversations.length]);

  React.useEffect(() => {
    if (!selectedConversationId || !establishmentId) {
      setDetail(null);
      setLoadingDetail(false);
      return;
    }
    let ignore = false;
    setLoadingDetail(true);
    getWhatsappConversationDetailAction(selectedConversationId, establishmentId)
      .then((res) => {
        if (!ignore && res.status === "success" && res.data) {
          setDetail(res.data);
          setTimeout(scrollToBottom, 50);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingDetail(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [selectedConversationId, establishmentId]);

  const handleTakeover = async () => {
    if (!selectedConversationId || !establishmentId) return;
    setActionInProgress(true);
    try {
      const res = await takeoverWhatsappConversationAction(selectedConversationId, establishmentId);
      if (res.status === "success" && res.data) {
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? { ...c, status: "HUMAN_TAKEN" } : c)),
        );
        if (detail) {
          setDetail({
            ...detail,
            conversation: {
              ...detail.conversation,
              status: "HUMAN_TAKEN",
            },
          });
        }
      }
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRelease = async () => {
    if (!selectedConversationId || !establishmentId) return;
    setActionInProgress(true);
    try {
      const res = await releaseWhatsappConversationAction(selectedConversationId, establishmentId);
      if (res.status === "success" && res.data) {
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? { ...c, status: "BOT_ACTIVE" } : c)),
        );
        if (detail) {
          setDetail({
            ...detail,
            conversation: {
              ...detail.conversation,
              status: "BOT_ACTIVE",
            },
          });
        }
      }
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !establishmentId || !messageText.trim()) return;

    setSendingMessage(true);
    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const res = await sendWhatsappMessageAction(selectedConversationId, establishmentId, textToSend);
      if (res.status === "success" && res.data) {
        if (detail) {
          setDetail({
            ...detail,
            messages: [...detail.messages, res.data],
          });
        }
        setTimeout(scrollToBottom, 50);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedConv =
    conversations.find((c) => c.id === selectedConversationId) ??
    (detail && detail.conversation.id === selectedConversationId ? detail.conversation : undefined);

  return (
    <div className="grid h-[780px] grid-cols-12 gap-4 rounded-xl border border-border/80 bg-background overflow-hidden">
      <ChatConversationList
        conversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        isConnected={isConnected}
      />

      <ChatMessageThread
        selectedConv={selectedConv}
        detail={detail}
        loadingDetail={loadingDetail}
        actionInProgress={actionInProgress}
        sendingMessage={sendingMessage}
        messageText={messageText}
        onMessageTextChange={setMessageText}
        onTakeover={handleTakeover}
        onRelease={handleRelease}
        onSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />

      <ChatCustomerQuickProfile
        customer={detail?.customer}
        selectedConv={selectedConv}
        onOpenCustomerDetail={onOpenCustomerDetail}
      />
    </div>
  );
}
