import "server-only";

import { apiClient, createCorrelationId } from "./api-client";
import type { RequestContext } from "./request-context";

/**
 * Edge builder for the authoritative `RequestContext` carried by every
 * protected adapter.
 *
 * Callers (Server Components, Server Actions, Route Handlers) construct the
 * context once per request and pass it down. The builder:
 *
 *   - accepts a verified session (token + tenant) supplied by the proxy or
 *     the session query service; never reads it from headers or body;
 *   - reuses an upstream `X-Correlation-Id` only when it matches the strict
 *     UUID/hex shape; otherwise it generates a fresh id;
 *   - never re-exports the session or correlation id into non-server code.
 */
export type EdgeRequestInput = Readonly<{
  token?: string;
  tenantId?: string;
  /** Optional trusted upstream correlation id, validated before reuse. */
  incomingCorrelationId?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}>;

const CORRELATION_PATTERN = /^[A-Za-z0-9_-]{6,128}$/;

function sanitizeIncomingCorrelation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!CORRELATION_PATTERN.test(trimmed)) return undefined;
  return trimmed;
}

export function buildRequestContext(input: EdgeRequestInput = {}): RequestContext {
  const token = input.token?.trim();
  const tenantId = input.tenantId?.trim();
  return {
    ...(token ? { token } : {}),
    ...(tenantId ? { tenantId } : {}),
    correlationId:
      sanitizeIncomingCorrelation(input.incomingCorrelationId) ?? createCorrelationId(),
    ...(input.signal ? { signal: input.signal } : {}),
    ...(input.timeoutMs ? { timeoutMs: input.timeoutMs } : {}),
  };
}

/**
 * Returns true when the value is a non-empty string with at least one
 * non-whitespace character. Centralised so adapters reject empty tenant ids
 * consistently instead of forwarding blank `X-Organization-Id` headers.
 */
export function hasNonEmptyTenant(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export { apiClient };
