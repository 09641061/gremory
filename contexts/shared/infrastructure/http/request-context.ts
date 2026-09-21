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

  // Security and tracing context is owned by the caller, not arbitrary per-request
  // headers.  In particular, do not allow a transport header to replace the
  // authenticated token, tenant, or request correlation ID.
  if (context.token) {
    merged.Authorization = `Bearer ${context.token}`;
  }

  if (context.tenantId) {
    merged["X-Organization-Id"] = context.tenantId;
  }

  if (context.correlationId) {
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

