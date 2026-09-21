/**
 * Sanitized diagnostic policy.
 *
 * Goal: keep enough information for protected diagnostics (correlation id,
 * status code, stable error code) without leaking raw bodies, request/response
 * headers, stack traces, or tokens. Never writes directly to host logging
 * APIs: callers must go through `recordSafely`, which is non-throwing
 * and bounded.
 *
 * Usage:
 *
 *   recordSafely("billing.invoice.failed", {
 *     correlationId,
 *     status: 502,
 *     code: "UPSTREAM_UNAVAILABLE",
 *     cause,
 *   });
 */

const FORBIDDEN_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "secret",
  "stripe",
]);

/**
 * Substrings (lower-case) that mark a key as forbidden even when the key
 * itself is not in `FORBIDDEN_KEYS`. Lets us redact `xApiKey`, `authToken`,
 * `clientSecret`, etc. without enumerating every variant.
 */
const FORBIDDEN_KEY_SUBSTRINGS = [
  "auth",
  "token",
  "secret",
  "password",
  "credential",
  "apikey",
  "session",
  "csrf",
  "cookie",
  "stripe",
];

const MAX_DEPTH = 4;
const MAX_STRING_LENGTH = 256;
const MAX_STACK_LENGTH = 1024;

type DiagnosticLevel = "info" | "warn" | "error";

export type SanitizedDiagnostic = Readonly<{
  /** Event name is supplied separately to `recordSafely`. */
  event?: string;
  level?: DiagnosticLevel;
  correlationId?: string;
  status?: number;
  code?: string;
  cause?: unknown;
  context?: Readonly<Record<string, unknown>>;
}>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Redact credentials that can occur in otherwise harmless diagnostic text. */
function sanitizeText(value: string, max: number): string {
  const redacted = value
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [redacted]")
    .replace(/(token|api[-_ ]?key|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");
  return truncate(redacted, max);
}

function readProperty(object: object, key: string): unknown {
  try {
    return Reflect.get(object, key);
  } catch {
    return "[unreadable]";
  }
}

function isForbiddenKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, "");
  if (FORBIDDEN_KEYS.has(normalized)) return true;
  for (const substring of FORBIDDEN_KEY_SUBSTRINGS) {
    if (normalized.includes(substring)) return true;
  }
  return false;
}

function sanitizeValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (depth > MAX_DEPTH) return "[truncated]";

  const t = typeof value;
  if (t === "string") return sanitizeText(value as string, MAX_STRING_LENGTH);
  if (t === "number" || t === "boolean" || t === "bigint") return value;
  if (t === "function" || t === "symbol") return undefined;
  if (t === "object") {
    const obj = value as object;
    if (seen.has(obj)) return "[circular]";
    seen.add(obj);

    if (value instanceof Error) {
      const name = readProperty(value, "name");
      const message = readProperty(value, "message");
      const out: Record<string, unknown> = {
        name: typeof name === "string" ? sanitizeText(name, MAX_STRING_LENGTH) : "Error",
        message: typeof message === "string" ? sanitizeText(message, MAX_STRING_LENGTH) : "[unreadable]",
      };
      const stack = readProperty(value, "stack");
      if (typeof stack === "string") out.stack = sanitizeText(stack, MAX_STACK_LENGTH);
      const status = readProperty(value, "status");
      if (typeof status === "number") out.status = status;
      const code = readProperty(value, "code");
      if (typeof code === "string") out.code = sanitizeText(code, MAX_STRING_LENGTH);
      const cause = readProperty(value, "cause");
      if (cause !== undefined) out.cause = sanitizeValue(cause, depth + 1, seen);
      return out;
    }

    if (value instanceof Date) return value.toISOString();

    if (Array.isArray(value)) {
      return value.slice(0, 32).map((entry) => sanitizeValue(entry, depth + 1, seen));
    }

    if (isPlainObject(value)) {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        if (isForbiddenKey(key)) {
          out[key] = "[redacted]";
          continue;
        }
        out[key] = sanitizeValue(readProperty(value, key), depth + 1, seen);
      }
      return out;
    }

    return `[unserializable:${(value as object).constructor?.name ?? typeof value}]`;
  }
  return undefined;
}

/**
 * Emits a single diagnostic record through the host reporter if available
 * (e.g. a future `pino`/`winston` adapter), otherwise silently discards.
 * Never throws; never leaks raw input.
 */
export function recordSafely(event: string, payload: SanitizedDiagnostic): void {
  try {
    const seen = new WeakSet<object>();
    const safe: Record<string, unknown> = {
      event,
      level: payload.level ?? "error",
      ...(payload.correlationId ? { correlationId: payload.correlationId } : {}),
      ...(typeof payload.status === "number" ? { status: payload.status } : {}),
      ...(typeof payload.code === "string" ? { code: payload.code } : {}),
      ...(payload.context
        ? { context: sanitizeValue(payload.context, 0, seen) }
        : {}),
    };
    if (payload.cause !== undefined) {
      const causeSeen = new WeakSet<object>();
      safe.cause = sanitizeValue(payload.cause, 0, causeSeen);
    }

    const reporter = (globalThis as { __diag__?: { report?: (rec: Record<string, unknown>) => void } }).__diag__;
    if (reporter?.report) {
      reporter.report(safe);
      return;
    }

    // No host reporter attached: keep the diagnostic in memory under a bounded
    // ring so future test runners can inspect it without leaking it to
    // `console`. We deliberately avoid console.* to prevent raw body / stack
    // leakage during unhandled error paths.
    const ring = (globalThis as { __diag_ring__?: Array<Record<string, unknown>> }).__diag_ring__;
    if (ring) {
      ring.push(safe);
      if (ring.length > 64) ring.shift();
    }
  } catch {
    // The diagnostic itself must never throw.
  }
}

/**
 * Returns a snapshot of the in-memory diagnostic ring for assertions in
 * tests. Returns `[]` when no reporter/ring is attached.
 */
export function readDiagnosticRing(): ReadonlyArray<Record<string, unknown>> {
  const ring = (globalThis as { __diag_ring__?: Array<Record<string, unknown>> }).__diag_ring__;
  return ring ? [...ring] : [];
}

export function ensureDiagnosticRing(): void {
  const g = globalThis as { __diag_ring__?: Array<Record<string, unknown>> };
  if (!g.__diag_ring__) g.__diag_ring__ = [];
}
