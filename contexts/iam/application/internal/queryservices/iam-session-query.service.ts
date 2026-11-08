import type { IamAuthenticationWriter } from "../../ports/iam-authentication-writer";
import type { RefreshCoordinator } from "../../ports/iam-session-coordinator";
import type { IamAuthenticationQueryService } from "../../services/iam-authentication-query.service";
import type { IamSessionQueryService } from "../../services/iam-session-query.service";
import type { ResolvedSession } from "../../model/resolved-session";
import type { ResolveSessionQuery } from "../../../domain/model/queries/resolve-session.query";
import { isClientRejection } from "@/contexts/shared/application/errors/transport-error";

/**
 * Pure query handler. Infrastructure provides the gateway (typed as the
 * Application port), the refresh coordinator function, and the access
 * verifier; this service composes them. It must not import concrete
 * gateways or cookies.
 */
export class IamSessionQueryServiceImpl implements IamSessionQueryService {
  constructor(
    private readonly authenticationQueries: IamAuthenticationQueryService,
    private readonly authenticationCommands: IamAuthenticationWriter,
    private readonly refreshCoordinator: RefreshCoordinator,
  ) {}

  async resolveSession(query: ResolveSessionQuery): Promise<ResolvedSession> {
    if (query.accessToken) {
      const verification = await this.authenticationQueries.verifyAccessToken(
        query.accessToken,
      );

      if (verification === "authenticated") {
        return {
          status: "authenticated",
          accessToken: query.accessToken,
          rotatedSession: null,
        };
      }
      if (verification === "unavailable") return { status: "unavailable" };
    }

    if (!query.refreshToken) return { status: "unauthenticated" };

    const rotatedSession = await this.refreshCoordinator(
      query.refreshToken,
      async (refreshToken) => {
        try {
          return await this.authenticationCommands.refreshSession({ refreshToken });
        } catch (error) {
          if (isClientRejection(error, [400, 401])) {
            return null;
          }
          throw error;
        }
      },
    ).catch(() => undefined);

    if (rotatedSession === undefined) return { status: "unavailable" };
    if (rotatedSession === null) return { status: "unauthenticated" };

    const verification = await this.authenticationQueries.verifyAccessToken(
      rotatedSession.accessToken,
    );
    if (verification !== "authenticated") return { status: verification };

    return {
      status: "authenticated",
      accessToken: rotatedSession.accessToken,
      rotatedSession,
    };
  }
}
