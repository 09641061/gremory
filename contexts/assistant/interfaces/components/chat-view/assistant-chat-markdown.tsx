"use client";

import { cn } from "@/lib/utils";

type AssistantChatMarkdownProps = {
  html: string;
  className?: string;
};

export function AssistantChatMarkdown({ html, className }: AssistantChatMarkdownProps) {
  return <div className={cn("min-w-0 overflow-x-auto break-words", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
