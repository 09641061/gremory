"use client";

import * as React from "react";
import { AlertCircle, Bot, Search, UserCheck } from "lucide-react";
import type { WhatsappConversationSummary } from "@/contexts/chat/application/models/whatsapp-chat";
import { useChatTranslations } from "@/contexts/chat/interfaces/i18n";
import { Avatar, AvatarFallback } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ScrollArea } from "@/contexts/shared/interfaces/components/ui/scroll-area";

export interface ChatConversationListProps {
  conversations: WhatsappConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  filter: "NEEDS_ATTENTION" | "ALL";
  onFilterChange: (filter: "NEEDS_ATTENTION" | "ALL") => void;
  search: string;
  onSearchChange: (search: string) => void;
  isConnected: boolean;
}

export function ChatConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  isConnected,
}: ChatConversationListProps) {
  const t = useChatTranslations();

  return (
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
            onClick={() => onFilterChange("NEEDS_ATTENTION")}
          >
            {t.chat.filterNeedsAttention}
          </Button>
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="xs"
            className="flex-1 text-xs"
            onClick={() => onFilterChange("ALL")}
          >
            {t.chat.filterAll}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={() => onSelectConversation(c.id)}
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
  );
}
