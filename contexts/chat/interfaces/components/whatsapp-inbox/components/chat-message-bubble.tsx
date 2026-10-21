"use client";

import * as React from "react";
import { AlertCircle, Bot, Check, CheckCheck, UserCheck } from "lucide-react";
import type { WhatsappMessageItem } from "@/contexts/chat/application/models/whatsapp-chat";
import { useChatTranslations } from "@/contexts/chat/interfaces/i18n";

export interface ChatMessageBubbleProps {
  message: WhatsappMessageItem;
  senderName: string;
}

export function ChatMessageBubble({ message, senderName }: ChatMessageBubbleProps) {
  const t = useChatTranslations();
  const isInbound = message.direction === "INBOUND";
  const isBot = message.direction === "OUTBOUND_BOT";
  const isHuman = message.direction === "OUTBOUND_HUMAN";

  return (
    <div className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}>
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
          {isInbound && <span>{senderName}</span>}
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
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {/* Metadata: Time and Delivery Status */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isInbound && (
            <span>
              {message.deliveryStatus === "SENT" && <Check className="size-2.5" />}
              {(message.deliveryStatus === "DELIVERED" || message.deliveryStatus === "READ") && (
                <CheckCheck className="size-2.5" />
              )}
              {message.deliveryStatus === "FAILED" && <AlertCircle className="size-2.5 text-destructive" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
