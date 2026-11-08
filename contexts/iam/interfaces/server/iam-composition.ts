import "server-only";

import { coordinateRefresh } from "../../infrastructure/session/iam-refresh-coordinator";
import { IamApiGateway } from "../../infrastructure/gateways/iam-api.gateway";
import type { IamAuthenticationWriter } from "../../application/ports/iam-authentication-writer";
import type {
  IamAccessTokenVerifier,
  IamSessionReader,
} from "../../application/ports/iam-session-reader";
import type { RefreshCoordinator } from "../../application/ports/iam-session-coordinator";
import type { IamSessionQueryService } from "../../application/services/iam-session-query.service";
import { IamSessionQueryServiceImpl } from "../../application/internal/queryservices/iam-session-query.service";

/**
 * Server-only composition for the IAM bounded context.
 *
 * `composeIamAdapters` is the single entry point used by Server Actions, Route
 * Handlers, the proxy, and shared shell queries. It owns the lifecycle of the
 * `IamApiGateway` so callers never instantiate it directly.
 *
 * The gateway implements `IamAuthenticationWriter` and `IamAccessTokenVerifier`
 * directly; the `IamSessionQueryService` is composed on top of the gateway plus
 * a refresh coordinator so it can answer the more involved "resolve session"
 * question. Callers receive every handle they need through one call.
 */
export type ComposedIamAdapters = Readonly<{
  authenticationWriter: IamAuthenticationWriter;
  accessTokenVerifier: IamAccessTokenVerifier;
  sessionReader: IamSessionReader;
  refreshCoordinator: RefreshCoordinator;
  sessionQueryService: IamSessionQueryService;
}>;

export function composeIamAdapters(): ComposedIamAdapters {
  const gateway = new IamApiGateway();
  const sessionQueryService = new IamSessionQueryServiceImpl(
    gateway,
    gateway,
    coordinateRefresh,
  );
  // The session reader (resolveSession) is the most derived service. The
  // gateway only exposes the access-token verifier; the query service is the
  // seam that combines them with refresh coordination.
  const sessionReader: IamSessionReader = sessionQueryService;
  return {
    authenticationWriter: gateway,
    accessTokenVerifier: gateway,
    sessionReader,
    refreshCoordinator: coordinateRefresh,
    sessionQueryService,
  };
}

/**
 * Convenience for the proxy and edge code that only need a session reader.
 * Avoids constructing the full composition when only `resolveSession` /
 * `verifyAccessToken` are needed.
 */
export function composeIamSessionReader(): {
  sessionReader: IamSessionReader;
  accessTokenVerifier: IamAccessTokenVerifier;
} {
  const gateway = new IamApiGateway();
  const sessionReader: IamSessionReader = new IamSessionQueryServiceImpl(
    gateway,
    gateway,
    coordinateRefresh,
  );
  return {
    sessionReader,
    accessTokenVerifier: gateway,
  };
}
