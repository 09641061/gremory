export type ApiRequestContext = Readonly<{
  token?: string;
  tenantId?: string;
  /** Correlates this request with backend diagnostics without carrying secrets. */
  correlationId?: string;
  /** Caller-provided cancellation signal. */
  signal?: AbortSignal;
  /** Per-operation deadline in milliseconds. */
  timeoutMs?: number;
}>;

export type AuthenticatedRequestContext = Readonly<{
  token: string;
  tenantId?: string;
}>;

export function buildApiRequestHeaders(
  context: ApiRequestContext = {},
  headers?: HeadersInit,
): Record<string, string> {
  const merged = toHeaderRecord(headers);

  if (context.token && !hasHeader(merged, "authorization")) {
    merged.Authorization = `Bearer ${context.token}`;
  }

  if (context.tenantId && !hasHeader(merged, "x-organization-id")) {
    merged["X-Organization-Id"] = context.tenantId;
  }

  if (context.correlationId && !hasHeader(merged, "x-correlation-id")) {
    merged["X-Correlation-Id"] = context.correlationId;
  }

  return merged;
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((header) => header.toLowerCase() === name);
}
