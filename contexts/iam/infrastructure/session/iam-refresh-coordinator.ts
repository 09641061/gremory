import "server-only";

import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";

type RefreshOperation = Promise<AuthenticationSession | null>;

const inFlightRefreshes = new Map<string, RefreshOperation>();

/**
 * Shares one refresh request between concurrent server requests that received
 * the same refresh token from the cookie jar.
 */
export function coordinateRefresh(
  refreshToken: string,
  refresh: (refreshToken: string) => RefreshOperation,
): RefreshOperation {
  const current = inFlightRefreshes.get(refreshToken);
  if (current) return current;

  const operation = refresh(refreshToken);
  inFlightRefreshes.set(refreshToken, operation);

  void operation.then(
    () => removeIfCurrent(refreshToken, operation),
    () => removeIfCurrent(refreshToken, operation),
  );

  return operation;
}

function removeIfCurrent(refreshToken: string, operation: RefreshOperation) {
  if (inFlightRefreshes.get(refreshToken) === operation) {
    inFlightRefreshes.delete(refreshToken);
  }
}
