import "server-only";

/**
 * Authoritative request-scoped context propagated from the server edge to
 * every protected adapter.
 *
 * Headers supplied by the browser (form data, JSON body, querystring, etc.)
 * never replace the security and tracing values emitted by `RequestContext`.
 * The adapter that owns the request builds a single `RequestContext` from the
 * verified session and forwards it explicitly to the gateway. Treating that
 * value as authoritative is the only way to defeat header spoofing from
 * client-controlled inputs.
 */
export type RequestContext = Readonly<{
  /** Verified access token for the current request. */
  token?: string;
  /** Verified tenant (organization) for the current request. */
  tenantId?: string;
  /** Server-generated or validated correlation id for protected diagnostics. */
  correlationId?: string;
  /** Caller-provided cancellation signal. */
  signal?: AbortSignal;
  /** Per-operation deadline in milliseconds. */
  timeoutMs?: number;
}>;

/**
 * Backwards-compatible alias kept for adapters that already document the
 * narrow "authenticated" subset. New code should use `RequestContext`.
 */
export type AuthenticatedRequestContext = Readonly<{
  token: string;
  tenantId?: string;
}>;

export type ApiRequestContext = RequestContext;

/**
 * Headers owned by the server edge. These names are matched
 * case-insensitively against any caller-supplied record so a browser cannot
 * override them via casing tricks.
 */
const SERVER_AUTHORITATIVE_HEADERS = [
  "Authorization",
  "X-Organization-Id",
  "X-Correlation-Id",
] as const;

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

/**
 * Removes every casing variant of the given header from the merged record so
 * the authoritative value is the only one that survives.
 */
function stripHeaderIgnoreCase(
  merged: Record<string, string>,
  name: string,
): void {
  const target = name.toLowerCase();
  for (const key of Object.keys(merged)) {
    if (key.toLowerCase() === target) delete merged[key];
  }
}

/**
 * Builds the header record sent on the wire for a given `RequestContext`.
 *
 * Context-provided security and tracing headers always win. Any value the
 * caller already supplied for `Authorization`, `X-Organization-Id` or
 * `X-Correlation-Id` is discarded so a client-controlled input cannot
 * downgrade the authenticated principal, tenant, or correlation id. Non-
 * security headers such as `Content-Type` or `Accept` still pass through.
 */
export function buildApiRequestHeaders(
  context: RequestContext = {},
  headers?: HeadersInit,
): Record<string, string> {
  const merged = toHeaderRecord(headers);

  // Always remove caller values first. An absent verified value means the
  // header must be absent, not that an untrusted caller value is acceptable.
  // This is deliberately done for every casing variant before adding the
  // server-owned value.
  for (const name of SERVER_AUTHORITATIVE_HEADERS) {
    stripHeaderIgnoreCase(merged, name);
  }

  if (context.token) merged.Authorization = `Bearer ${context.token}`;
  if (context.tenantId) merged["X-Organization-Id"] = context.tenantId;
  if (context.correlationId) merged["X-Correlation-Id"] = context.correlationId;

  return merged;
}

export { SERVER_AUTHORITATIVE_HEADERS };
