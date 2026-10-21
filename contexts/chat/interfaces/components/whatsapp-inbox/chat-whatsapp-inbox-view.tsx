"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Plus,
  Search,
  Send,
  User,
  UserCheck,
} from "lucide-react";
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
import { useChatTranslations } from "@/contexts/chat/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";

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
  const t = useChatTranslations();

  const [filter, setFilter] = React.useState<"NEEDS_ATTENTION" | "ALL">("NEEDS_ATTENTION");
  const [search, setSearch] = React.useState("");
  const [conversations, setConversations] = React.useState<WhatsappConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(initialConversationId ?? null);
  const [detail, setDetail] = React.useState<WhatsappConversationDetail | null>(null);

  const [messageText, setMessageText] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState(false);

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
        if (!selectedConversationId && res.data.content.length > 0) {
          setSelectedConversationId(res.data.content[0]?.id ?? null);
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, [establishmentId, filter, search, selectedConversationId]);

  React.useEffect(() => {
    if (!selectedConversationId || !establishmentId) {
      return;
    }
    let ignore = false;
    getWhatsappConversationDetailAction(selectedConversationId, establishmentId).then((res) => {
      if (!ignore && res.status === "success" && res.data) {
        setDetail(res.data);
        setTimeout(scrollToBottom, 50);
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

  const selectedConv = conversations.find((c) => c.id === selectedConversationId);
  const isBotActive = detail?.conversation.status === "BOT_ACTIVE";
  const needsHuman = detail?.conversation.status === "NEEDS_HUMAN";

  return (
    <div className="grid h-[780px] grid-cols-12 gap-4 rounded-xl border border-border/80 bg-background overflow-hidden">
      {/* 1. Left Column: Conversations List */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-border/80 flex flex-col h-full bg-muted/10">
        <div className="p-3 border-b border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.chat.inboxTitle}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block size-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-muted"}`}
                title={isConnected ? t.chat.online : "Disconnected"}
              />
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button
              variant={filter === "NEEDS_ATTENTION" ? "default" : "outline"}
              size="xs"
              className="flex-1 text-xs"
              onClick={() => setFilter("NEEDS_ATTENTION")}
            >
              {t.chat.filterNeedsAttention}
            </Button>
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="xs"
              className="flex-1 text-xs"
              onClick={() => setFilter("ALL")}
            >
              {t.chat.filterAll}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar teléfono o nombre..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/40">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {t.chat.noConversations}
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === selectedConversationId;
                const displayName = c.customerName || c.contactDisplayName || c.contactPhone;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConversationId(c.id)}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-3 hover:bg-muted/40 ${
                      isSelected ? "bg-muted/60 font-medium" : ""
                    }`}
                  >
                    <Avatar className="size-9 mt-0.5 border border-border/50">
                      <AvatarFallback className="text-xs bg-primary/5 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold truncate text-foreground">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {c.status === "BOT_ACTIVE" && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground flex items-center gap-0.5">
                            <Bot className="size-2.5" /> IA
                          </Badge>
                        )}
                        {c.status === "NEEDS_HUMAN" && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 animate-pulse">
                            <AlertCircle className="size-2.5" /> Requiere Staff
                          </Badge>
                        )}
                        {c.status === "HUMAN_TAKEN" && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5">
                            <UserCheck className="size-2.5" /> Atendido
                          </Badge>
                        )}

                        {c.summaryTag && (
                          <span className="text-[10px] text-muted-foreground truncate italic">
                            • {c.summaryTag}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate line-clamp-1">
                        {c.lastMessagePreview || "Sin mensajes"}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="size-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 2. Middle Column: Active Chat Messages */}
      <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col h-full bg-background border-r border-border/80">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-border/80 flex items-center justify-between bg-card/40">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 border border-border/50">
                  <AvatarFallback className="text-xs">
                    {(selectedConv.customerName || selectedConv.contactPhone).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-semibold leading-none text-foreground">
                    {selectedConv.customerName || selectedConv.contactDisplayName || selectedConv.contactPhone}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedConv.contactPhone}
                  </span>
                </div>
              </div>

              {/* Bot Handoff Controls */}
              <div className="flex items-center gap-2">
                {isBotActive || needsHuman ? (
                  <Button
                    variant={needsHuman ? "destructive" : "outline"}
                    size="xs"
                    onClick={handleTakeover}
                    disabled={actionInProgress}
                    className="text-xs gap-1.5"
                  >
                    <User className="size-3.5" />
                    {actionInProgress ? t.chat.takingOver : t.chat.takeover}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleRelease}
                    disabled={actionInProgress}
                    className="text-xs gap-1.5 text-muted-foreground"
                  >
                    <Bot className="size-3.5" />
                    {actionInProgress ? t.chat.releasing : t.chat.release}
                  </Button>
                )}
              </div>
            </div>

            {/* Banner: State Indicator */}
            {isBotActive && (
              <div className="px-3 py-1.5 bg-muted/40 border-b border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                <Bot className="size-3.5 text-primary" />
                <span>{t.chat.botManagingBanner}</span>
              </div>
            )}
            {!selectedConv.customerServiceWindowOpen && (
              <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Clock className="size-3.5" />
                <span>{t.chat.windowExpiredBanner}</span>
              </div>
            )}

            {/* Messages Thread */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="space-y-3">
                {detail?.messages.map((m) => {
                  const isInbound = m.direction === "INBOUND";
                  const isBot = m.direction === "OUTBOUND_BOT";
                  const isHuman = m.direction === "OUTBOUND_HUMAN";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-xl px-3.5 py-2 text-xs shadow-xs ${
                          isInbound
                            ? "bg-card border border-border/80 text-foreground"
                            : isBot
                            ? "bg-muted/80 border border-border/60 text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {/* Sender Tag */}
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75 font-medium">
                          {isInbound && <span>{selectedConv.customerName || selectedConv.contactPhone}</span>}
                          {isBot && (
                            <span className="flex items-center gap-1">
                              <Bot className="size-2.5" /> {t.chat.assistantLabel}
                            </span>
                          )}
                          {isHuman && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="size-2.5" /> {t.chat.receptionLabel}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>

                        {/* Metadata: Time and Delivery Status */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!isInbound && (
                            <span>
                              {m.deliveryStatus === "SENT" && <Check className="size-2.5" />}
                              {(m.deliveryStatus === "DELIVERED" || m.deliveryStatus === "READ") && (
                                <CheckCheck className="size-2.5" />
                              )}
                              {m.deliveryStatus === "FAILED" && <AlertCircle className="size-2.5 text-destructive" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border/80 flex items-center gap-2 bg-card/30">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t.chat.typeMessagePlaceholder}
                disabled={sendingMessage}
                className="flex-1 text-xs h-9"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sendingMessage || !messageText.trim()}
                className="gap-1.5 px-3 h-9 text-xs"
              >
                <Send className="size-3.5" />
                <span>{sendingMessage ? t.chat.sending : t.chat.send}</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
            <Bot className="size-8 text-muted-foreground/40 mb-2" />
            <p>{t.chat.selectConversationPrompt}</p>
          </div>
        )}
      </div>

      {/* 3. Right Column: Quick CRM Profile / Registration */}
      <div className="hidden lg:flex col-span-3 flex-col h-full bg-card/20 p-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {t.chat.quickCrmTitle}
          </h4>

          {detail?.customer ? (
            <Card className="border-border/80 bg-background/50 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center justify-between">
                  <span>{detail.customer.name}</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {detail.customer.documentType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs space-y-2">
                <div className="text-muted-foreground">
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">Documento</span>
                  <span className="font-mono text-foreground">{detail.customer.documentNumber}</span>
                </div>
                {detail.customer.email && (
                  <div className="text-muted-foreground">
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">Email</span>
                    <span className="text-foreground truncate block">{detail.customer.email}</span>
                  </div>
                )}
                {onOpenCustomerDetail && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="w-full mt-2 text-xs"
                    onClick={() => onOpenCustomerDetail(detail.customer!.id)}
                  >
                    Ver Ficha Completa
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : selectedConv ? (
            <Card className="border-border/80 bg-background/50 shadow-none p-3 space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  {t.chat.prospectTitle}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.chat.prospectDescription}
                </p>
              </div>

              <div className="p-2.5 rounded-md bg-muted/40 space-y-1 text-xs">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Teléfono detectado</span>
                <p className="font-mono font-medium text-foreground">{selectedConv.contactPhone}</p>
              </div>

              <Link
                href={`/crm/new?phone=${encodeURIComponent(selectedConv.contactPhone)}&name=${encodeURIComponent(
                  selectedConv.contactDisplayName || "",
                )}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="size-3.5" />
                {t.chat.registerCustomer}
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
