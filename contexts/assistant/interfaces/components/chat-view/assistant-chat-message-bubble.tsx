"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

import type { AssistantMessageViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";
import { AssistantAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu";

function normalizeAssistantMarkdownContent(content: string): string {
  const normalizedLines = content.replace(/\r\n/g, "\n").split("\n");

  return normalizedLines
    .map((line) => {
      if (!/\d+\.\s+.*\d+\.\s+/.test(line)) {
        return line;
      }

      return line.replace(/(?<=\S)\s+(?=\d+\.\s+)/g, "\n");
    })
    .join("\n")
    .replace(/(?:^|\n)\s*\u2022\s+/g, "\n- ")
    .replace(/\s+\u2022\s+/g, "\n- ");
}

interface AssistantChatMessageBubbleProps {
  message: AssistantMessageViewModel;
}

function AssistantChatMessageBubbleComponent({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const assistantMarkdownClassName =
    "min-w-0 overflow-x-auto break-words pt-1 text-[15px] leading-7 text-foreground " +
    "[&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-[1.6rem] [&_h1]:font-semibold [&_h1]:leading-tight " +
    "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-[1.35rem] [&_h2]:font-semibold [&_h2]:leading-tight " +
    "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-[1.15rem] [&_h3]:font-semibold [&_h3]:leading-tight " +
    "[&_p]:my-3 " +
    "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6 " +
    "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6 " +
    "[&_li]:my-1 " +
    "[&_blockquote]:my-4 [&_blockquote]:rounded-xl [&_blockquote]:border-l-2 [&_blockquote]:border-border/70 [&_blockquote]:bg-muted/20 [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:py-3 [&_blockquote]:text-muted-foreground " +
    "[&_hr]:my-6 [&_hr]:border-border/60 " +
    "[&_table]:min-w-max [&_table]:border-separate [&_table]:border-spacing-x-4 [&_table]:border-spacing-y-2 " +
    "[&_th]:whitespace-nowrap [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:align-top " +
    "[&_td]:px-4 [&_td]:py-2 [&_td]:align-top " +
    "[&_thead_th]:border-b [&_thead_th]:border-border/60 " +
    "[&_tbody_tr:not(:last-child)_td]:border-b [&_tbody_tr:not(:last-child)_td]:border-border/30 " +
    "[&_code]:rounded-md [&_code]:border [&_code]:border-border/60 [&_code]:bg-muted/80 [&_code]:px-1.5 [&_code]:py-0.5 " +
    "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground [&_code]:shadow-[inset_0_-1px_0_rgba(255,255,255,0.45)] " +
    "[&_pre_code]:rounded-none [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0 [&_pre_code]:text-inherit [&_pre_code]:shadow-none " +
    "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border/60 " +
    "[&_pre]:bg-muted/30 [&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-[13px] [&_pre]:leading-6";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        !isUser && "items-start gap-3 max-w-[min(48rem,calc(100vw-6rem))] sm:max-w-[42rem]",
      )}
    >
      {!isUser ? (
        <>
          <AssistantAvatar
            className="mt-1 size-10"
            iconSize={20}
            iconClassName="size-5"
            variant="flat"
          />

          <div className={assistantMarkdownClassName}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {normalizeAssistantMarkdownContent(message.content)}
            </ReactMarkdown>
          </div>
        </>
      ) : (
        <div
          className={cn(
            "max-w-[min(22rem,calc(100vw-6rem))] whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground sm:max-w-[26rem]",
            "rounded-2xl border border-[#e7edf4] bg-[#f8fafc] px-4 py-3 shadow-none",
          )}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}

export const AssistantChatMessageBubble = memo(
  AssistantChatMessageBubbleComponent,
  (previousProps, nextProps) =>
    previousProps.message.id === nextProps.message.id &&
    previousProps.message.role === nextProps.message.role &&
    previousProps.message.content === nextProps.message.content,
);
