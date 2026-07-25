import "server-only";

import type { IamAuthenticationCommandService } from "../../../domain/services/iam-authentication-command.service";
import type { IamAuthenticationQueryService } from "../../services/iam-authentication-query.service";
import type { IamSessionQueryService } from "../../services/iam-session-query.service";
import type { ResolvedSession } from "../../model/resolved-session";
import type { ResolveSessionQuery } from "../../../domain/model/queries/resolve-session.query";
import { IamApiError, IamApiGateway } from "../../../infrastructure/gateways/iam-api.gateway";
import { coordinateRefresh } from "../../../infrastructure/session/iam-refresh-coordinator";

type RefreshCoordinator = (
  refreshToken: string,
  refresh: (refreshToken: string) => Promise<import("../../../domain/model/entities/authentication-session").AuthenticationSession | null>,
) => Promise<import("../../../domain/model/entities/authentication-session").AuthenticationSession | null>;

export class IamSessionQueryServiceImpl implements IamSessionQueryService {
  constructor(
    private readonly authenticationQueries: IamAuthenticationQueryService,
    private readonly authenticationCommands: IamAuthenticationCommandService,
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
          if (
            error instanceof IamApiError &&
            (error.status === 400 || error.status === 401)
          ) {
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

export function createIamSessionQueryService(): IamSessionQueryService {
  const gateway = new IamApiGateway();
  return new IamSessionQueryServiceImpl(gateway, gateway, coordinateRefresh);
}
