/**
 * Shared lifecycle helpers for panel data fetching.
 *
 * Panels fetch once on mount and refresh only after an explicit mutation. When a
 * background request still fails with an authentication/authorization status
 * (a refreshed or expired session), the UI must never surface the raw
 * engineering error over an empty table: it either redirects to sign in (401)
 * or silently keeps the last known good data (403).
 */

export function isUnauthenticated(status: number): boolean {
  return status === 401;
}

export function isForbidden(status: number): boolean {
  return status === 403;
}

/** A stale/expired session is handled silently: no raw banner, no thrown error. */
export function isAuthError(status: number): boolean {
  return isUnauthenticated(status) || isForbidden(status);
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  window.location.assign(new URL("/login", window.location.origin).toString());
}
