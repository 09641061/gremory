import "server-only";

import { visit } from "unist-util-visit";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

type HtmlElementNode = {
  type: "element";
  tagName: string;
  properties?: {
    className?: string | string[];
    rel?: string;
    target?: string;
    href?: string;
  };
  children?: HtmlElementNode[];
};

function setClassName(node: HtmlElementNode, className: string) {
  const current = node.properties?.className;
  const nextClassName = Array.isArray(current)
    ? [...current, className]
    : current
      ? [current, className]
      : [className];

  node.properties = {
    ...(node.properties ?? {}),
    className: nextClassName,
  };
}

function applyMarkdownClasses() {
  return (tree: unknown) => {
    visit(tree as HtmlElementNode, "element", (node, index, parent) => {
      switch (node.tagName) {
        case "p":
          setClassName(node, "mb-3 last:mb-0");
          break;
        case "h1":
          setClassName(node, "mb-3 text-xl font-semibold tracking-tight");
          break;
        case "h2":
          setClassName(node, "mb-3 text-lg font-semibold tracking-tight");
          break;
        case "h3":
          setClassName(node, "mb-2 text-base font-semibold tracking-tight");
          break;
        case "ul":
          setClassName(node, "mb-3 list-disc space-y-1 pl-5 last:mb-0");
          break;
        case "ol":
          setClassName(node, "mb-3 list-decimal space-y-1 pl-5 last:mb-0");
          break;
        case "li":
          setClassName(node, "leading-7");
          break;
        case "blockquote":
          setClassName(node, "mb-3 border-l-4 border-border/70 pl-4 italic text-muted-foreground last:mb-0");
          break;
        case "table":
          setClassName(node, "mb-4 min-w-max border-collapse overflow-hidden rounded-xl border border-border/60 text-sm last:mb-0");
          break;
        case "thead":
          setClassName(node, "bg-muted/70");
          break;
        case "th":
          setClassName(node, "border-b border-border/60 px-3 py-2 text-left font-semibold text-foreground");
          break;
        case "td":
          setClassName(node, "border-b border-border/40 px-3 py-2 align-top text-foreground");
          break;
        case "tr":
          setClassName(node, "even:bg-muted/30");
          break;
        case "code":
          if (parent?.tagName === "pre") {
            setClassName(node, "block rounded-xl bg-muted px-4 py-3 font-mono text-[13px] leading-6");
          } else {
            setClassName(node, "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground");
          }
          break;
        case "pre":
          setClassName(node, "mb-4 overflow-x-auto rounded-xl bg-muted p-0 font-mono text-[13px] leading-6 last:mb-0");
          break;
        case "a":
          setClassName(node, "font-medium text-primary underline underline-offset-4 hover:opacity-80");
          node.properties = {
            ...(node.properties ?? {}),
            target: "_blank",
            rel: "noreferrer noopener",
          };
          break;
        case "hr":
          setClassName(node, "my-4 border-border/70");
          break;
      }
    });
  };
}

export function renderAssistantMarkdownToHtml(content: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(applyMarkdownClasses)
    .use(rehypeStringify)
    .processSync(content)
    .toString();
}
