
export function safePublicError(error: unknown, fallback = "Request could not be completed") {
  if (isOperationAuthorizationError(error)) {
    const code = (error as { code?: string }).code;
    return { message: code === "UNAUTHENTICATED" ? "Authentication required" : "Operation not permitted", status: code === "UNAUTHENTICATED" ? 401 : 403 };
  }
  if (isApiError(error) || isPublicHttpError(error)) {
    const messages: Record<number, string> = { 400: "Invalid request", 401: "Authentication required", 403: "Operation not permitted", 404: "Resource not found", 409: "Request conflicts with current state", 422: "Validation failed", 429: "Too many requests", 502: "Upstream service unavailable", 504: "Request timed out" };
    return { message: messages[error.status] ?? fallback, status: error.status >= 400 ? error.status : 500 };
  }
  return { message: fallback, status: 500 };
}

function isApiError(error: unknown): error is { status: number } {
  return error instanceof Error && error.name === "ApiError" && typeof (error as { status?: unknown }).status === "number";
}

function isPublicHttpError(error: unknown): error is { status: number } {
  if (!(error instanceof Error) || !["BillingAuthorizationError"].includes(error.name)) return false;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" && status >= 400 && status < 500;
}

function isOperationAuthorizationError(error: unknown): boolean {
  return error instanceof Error && error.name === "OperationAuthorizationError";
}
