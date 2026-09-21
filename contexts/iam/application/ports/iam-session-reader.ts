import type { ResolvedSession, AccessTokenVerification } from "../model/resolved-session";
import type { ResolveSessionQuery } from "../../domain/model/queries/resolve-session.query";

/**
 * Server-only contract for reading IAM session state.
 *
 * The implementation lives in Infrastructure; Application consumes the port
 * without depending on `fetch`, `next/headers`, or `cookies`. Composition
 * (in `interfaces/server/iam-composition.ts`) is the only place allowed to
 * instantiate the concrete gateway.
 */
export interface IamSessionReader {
  /**
   * Resolves the current session from the supplied access/refresh token pair.
   * Returns:
   *   - `authenticated` when the access token verifies or a refresh succeeds
   *   - `unauthenticated` when no session can be recovered
   *   - `unavailable` when the upstream is unreachable (the request is still
   *     considered safe to forward because the proxy can re-attempt later)
   */
  resolveSession(query: ResolveSessionQuery): Promise<ResolvedSession>;
}

/**
 * Narrow contract for verifying an access token, used by edge code that only
 * needs the access-token status (e.g. quick optimistic checks in proxy).
 */
export interface IamAccessTokenVerifier {
  verifyAccessToken(accessToken: string): Promise<AccessTokenVerification>;
}
