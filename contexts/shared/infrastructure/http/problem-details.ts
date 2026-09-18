export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [extension: string]: unknown;
}

export function extractProblemDetailsMessage(body: unknown): string | undefined {
  if (!body) return undefined;

  if (Array.isArray(body) && body.length > 0) {
    return extractProblemDetailsMessage(body[0]);
  }

  if (typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;

  const message = record.message;
  if (typeof message === "string" && message.length > 0) return message;

  const detail = record.detail;
  if (typeof detail === "string" && detail.length > 0) return detail;

  const title = record.title;
  if (typeof title === "string" && title.length > 0) return title;

  return undefined;
}
