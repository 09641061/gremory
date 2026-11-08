import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";

/**
 * Coordinates session refresh under concurrency. The contract is intentionally
 * narrow: callers hand in a refresh function and a token; the coordinator
 * collapses duplicate refresh attempts and returns the new session or `null`
 * when no rotation is possible.
 */
export type RefreshCoordinator = (
  refreshToken: string,
  refresh: (refreshToken: string) => Promise<AuthenticationSession | null>,
) => Promise<AuthenticationSession | null>;
