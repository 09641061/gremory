"use client";

import { memo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type AssistantChatMarkdownProps = {
  content: string;
  className?: string;
};

const markdownComponents = {
  p: ({ children }: { children?: ReactNode }) => <p className="mb-3 last:mb-0">{children}</p>,
  h1: ({ children }: { children?: ReactNode }) => <h1 className="mb-3 text-xl font-semibold tracking-tight">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="mb-3 text-lg font-semibold tracking-tight">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="mb-2 text-base font-semibold tracking-tight">{children}</h3>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mb-3 border-l-4 border-border/70 pl-4 italic text-muted-foreground last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <table className="mb-4 min-w-max border-collapse overflow-hidden rounded-xl border border-border/60 text-sm last:mb-0">
      {children}
    </table>
  ),
  thead: ({ children }: { children?: ReactNode }) => <thead className="bg-muted/70">{children}</thead>,
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-border/60 px-3 py-2 text-left font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-border/40 px-3 py-2 align-top text-foreground">{children}</td>
  ),
  tr: ({ children }: { children?: ReactNode }) => <tr className="even:bg-muted/30">{children}</tr>,
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    const isBlock = className?.includes("language-");

    if (isBlock) {
      return (
        <code className={cn("block rounded-xl bg-muted px-4 py-3 font-mono text-[13px] leading-6", className)}>
          {children}
        </code>
      );
    }

    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>;
  },
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-muted p-0 font-mono text-[13px] leading-6 last:mb-0">{children}</pre>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-border/70" />,
};

function AssistantChatMarkdownComponent({ content, className }: AssistantChatMarkdownProps) {
  return (
    <div className={cn("min-w-0 overflow-x-auto break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const AssistantChatMarkdown = memo(AssistantChatMarkdownComponent);
