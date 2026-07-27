"use client";

import { MessageSquareText, PlusCircle, Search } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { cn } from "@/lib/utils";

import type { AssistantConversationSummary } from "./assistant-chat.types";

interface AssistantChatSidebarProps {
  conversations: AssistantConversationSummary[];
  selectedConversationId?: string | null;
  search: string;
  isLoading: boolean;
  isCreating: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

export function AssistantChatSidebar({
  conversations,
  selectedConversationId,
  search,
  isLoading,
  isCreating,
  onSearchChange,
  onSelectConversation,
  onCreateConversation,
}: AssistantChatSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl shadow-slate-950/10">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Conversaciones
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-100">Chat</h2>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCreateConversation}
            disabled={isCreating}
            className="bg-slate-800 text-slate-100 hover:bg-slate-700"
            aria-label="Nuevo chat"
          >
            <PlusCircle className="size-4" />
            <span>{isCreating ? "Creando..." : "Nuevo chat"}</span>
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar conversaciones"
            className="h-10 border-slate-800 bg-slate-900/70 pl-9 text-slate-100 placeholder:text-slate-500 focus-visible:border-slate-600 focus-visible:ring-slate-500/30 dark:bg-slate-900/70"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            No hay conversaciones todavía. Crea una nueva para empezar.
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((conversation) => {
              const active = conversation.id === selectedConversationId;

              return (
                <Button
                  key={conversation.id}
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "h-auto w-full justify-start rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-slate-200 hover:border-white/10 hover:bg-white/5 hover:text-white",
                    active && "border-white/10 bg-white/10 text-white"
                  )}
                >
                  <MessageSquareText className="mr-2.5 size-4 shrink-0 text-slate-400" />
                  <span className="truncate">{conversation.title}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
