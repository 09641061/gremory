import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const htmlCache = new Map<string, string>();

export function renderAssistantMarkdownToHtml(content: string): string {
  if (htmlCache.has(content)) {
    return htmlCache.get(content) ?? "";
  }

  const renderedHtml = String(markdownProcessor.processSync(content));
  htmlCache.set(content, renderedHtml);
  return renderedHtml;
}
