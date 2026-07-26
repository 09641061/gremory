"use client";

import type { RefObject } from "react";
import { AlertCircle, Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AssistantChatMessage, AssistantConversation } from "./assistant-chat.types";

interface AssistantChatThreadProps {
  conversation: AssistantConversation | null;
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  error?: string | null;
}

function MessageBubble({ message }: { message: AssistantChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex items-end gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bot className="size-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[min(44rem,calc(100vw-7rem))] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[36rem]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/70 bg-card text-card-foreground",
        )}
      >
        {message.content}
      </div>

      {isUser ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-4" />
        </div>
      ) : null}
    </div>
  );
}

function WelcomeMessage({ bottomRef }: { bottomRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex items-end justify-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bot className="size-4" />
        </div>
        <div className="max-w-[min(44rem,calc(100vw-7rem))] rounded-3xl rounded-bl-md border border-border/70 bg-card px-4 py-3 text-sm leading-6 text-card-foreground shadow-sm sm:max-w-[36rem]">
          Hola, soy tu asistente. Escribime lo que necesitas y empezamos.
        </div>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}

export function AssistantChatThread({
  conversation,
  isLoading,
  bottomRef,
  error,
}: AssistantChatThreadProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Conversación activa
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold text-foreground">
            {conversation?.title ?? "Nuevo chat"}
          </h1>
        </div>
      </div>

      {error ? (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 sm:px-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(26,185,145,0.08),transparent_35%)] px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-20 animate-pulse rounded-3xl border border-border/40 bg-muted/30",
                  index % 2 === 0 ? "mr-10" : "ml-10",
                )}
              />
            ))}
          </div>
        ) : conversation?.messages.length ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <WelcomeMessage bottomRef={bottomRef} />
        )}
      </div>
    </section>
  );
}
