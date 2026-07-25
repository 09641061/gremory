import "server-only";

import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";

type RefreshOperation = Promise<AuthenticationSession | null>;

type RefreshEntry = {
  operation: RefreshOperation;
  expiresAt: number | null;
};

const rotatedSessionReuseWindowMs = 5_000;
const refreshes = new Map<string, RefreshEntry>();

/**
 * Shares one refresh request between concurrent server requests that received
 * the same refresh token from the cookie jar.
 */
export function coordinateRefresh(
  refreshToken: string,
  refresh: (refreshToken: string) => RefreshOperation,
): RefreshOperation {
  const current = refreshes.get(refreshToken);
  if (current && (current.expiresAt === null || current.expiresAt > Date.now())) {
    return current.operation;
  }
  if (current) refreshes.delete(refreshToken);

  const operation = refresh(refreshToken);
  const entry: RefreshEntry = { operation, expiresAt: null };
  refreshes.set(refreshToken, entry);

  void operation.then(
    (session) => {
      if (!session) {
        removeIfCurrent(refreshToken, entry);
        return;
      }

      entry.expiresAt = Date.now() + rotatedSessionReuseWindowMs;
      setTimeout(
        () => removeIfCurrent(refreshToken, entry),
        rotatedSessionReuseWindowMs,
      ).unref?.();
    },
    () => removeIfCurrent(refreshToken, entry),
  );

  return operation;
}

function removeIfCurrent(refreshToken: string, entry: RefreshEntry) {
  if (refreshes.get(refreshToken) === entry) {
    refreshes.delete(refreshToken);
  }
}
