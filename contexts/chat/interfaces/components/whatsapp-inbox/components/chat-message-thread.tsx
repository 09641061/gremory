"use client";

import * as React from "react";
import { Bot, Clock, Send, User } from "lucide-react";
import type {
  WhatsappConversationDetail,
  WhatsappConversationSummary,
} from "@/contexts/chat/application/models/whatsapp-chat";
import { useChatTranslations } from "@/contexts/chat/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";
import { ChatMessageBubble } from "./chat-message-bubble";

export interface ChatMessageThreadProps {
  selectedConv?: WhatsappConversationSummary;
  detail: WhatsappConversationDetail | null;
  actionInProgress: boolean;
  sendingMessage: boolean;
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onTakeover: () => void;
  onRelease: () => void;
  onSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageThread({
  selectedConv,
  detail,
  actionInProgress,
  sendingMessage,
  messageText,
  onMessageTextChange,
  onTakeover,
  onRelease,
  onSendMessage,
  messagesEndRef,
}: ChatMessageThreadProps) {
  const t = useChatTranslations();

  if (!selectedConv) {
    return (
      <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col h-full bg-background border-r border-border/80">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
          <Bot className="size-8 text-muted-foreground/40 mb-2" />
          <p>{t.chat.selectConversationPrompt}</p>
        </div>
      </div>
    );
  }

  const isBotActive = detail?.conversation.status === "BOT_ACTIVE";
  const needsHuman = detail?.conversation.status === "NEEDS_HUMAN";
  const displayName = selectedConv.customerName || selectedConv.contactDisplayName || selectedConv.contactPhone;

  return (
    <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col h-full bg-background border-r border-border/80">
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
              {displayName}
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
              onClick={onTakeover}
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
              onClick={onRelease}
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
          {detail?.messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              senderName={selectedConv.customerName || selectedConv.contactPhone}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input Footer */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-border/80 flex items-center gap-2 bg-card/30">
        <Input
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
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
    </div>
  );
}
