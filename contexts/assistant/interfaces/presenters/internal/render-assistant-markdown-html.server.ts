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

export function renderAssistantMarkdownToHtml(content: string): string {
  if (htmlCache.has(content)) {
    return htmlCache.get(content) ?? "";
  }

  const normalizedContent = normalizeAssistantMarkdownContent(content);
  const renderedHtml = String(markdownProcessor.processSync(normalizedContent));
  htmlCache.set(content, renderedHtml);
  return renderedHtml;
}
