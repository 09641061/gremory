/**
 * Application-owned transport error vocabulary.
 *
 * Application code classifies failures by `status` and `code` rather than by
 * catching the Infrastructure `ApiError` directly, so the Application layer
 * never imports concrete HTTP transports. Adapters populate the fields
 * from the upstream error before re-throwing.
 */

export type TransportErrorKind = "request" | "protocol" | "upstream" | "unknown";

/**
 * `TransportError` is the stable cross-BC error contract. Adapters translate
 * `fetch` failures, timeouts, invalid JSON, and non-2xx responses into one
 * of these objects; Application never sees `ApiError`, `Error.message`, or
 * raw response bodies.
 */
export class TransportError extends Error {
  readonly status?: number;
  readonly code: string;
  readonly kind: TransportErrorKind;
  readonly correlationId?: string;

  constructor(input: {
    message: string;
    code: string;
    kind: TransportErrorKind;
    status?: number;
    correlationId?: string;
  }) {
    super(input.message);
    this.name = "TransportError";
    this.code = input.code;
    this.kind = input.kind;
    if (input.status !== undefined) this.status = input.status;
    if (input.correlationId !== undefined) this.correlationId = input.correlationId;
  }
}

/**
 * Adapter hook: lets the Infrastructure `ApiError` (and any BC-specific
 * subclass) extend `TransportError` without naming it directly. The base
 * class is exported and is the only error contract Application consumes.
 */
export function asTransportError(
  status: number | undefined,
  code: string,
  kind: TransportErrorKind,
  message: string,
  correlationId?: string,
): TransportError {
  return new TransportError({ status, code, kind, message, correlationId });
}

/**
 * Predicate used by Application to discriminate 4xx rejections from
 * transport/availability failures without naming the Infrastructure class.
 */
export function isClientRejection(
  error: unknown,
  statuses: ReadonlyArray<number>,
): boolean {
  if (!(error instanceof TransportError)) return false;
  return typeof error.status === "number" && statuses.includes(error.status);
}

/**
 * Reads `status` from any value, defaulting to `undefined` when the input is
 * not a `TransportError`. Lets Application map an Infrastructure `ApiError`
 * into a transport-agnostic outcome without importing its class.
 */
export function readErrorStatus(error: unknown): number | undefined {
  if (error instanceof TransportError && typeof error.status === "number") {
    return error.status;
  }
  if (error && typeof error === "object") {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}
