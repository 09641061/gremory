import "server-only";

import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";
import type { IamAuthenticationCommandService } from "../../domain/services/iam-authentication-command.service";
import type { ConfirmEmailSignInCommand } from "../../domain/model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../../domain/model/commands/request-email-sign-in.command";
import type { RefreshSessionCommand } from "../../domain/model/commands/refresh-session.command";
import type { SignOutCommand } from "../../domain/model/commands/sign-out.command";
import type { VerifyMagicLinkCommand } from "../../domain/model/commands/verify-magic-link.command";
import type { IamAuthenticationQueryService } from "../../application/services/iam-authentication-query.service";
import type { AccessTokenVerification } from "../../application/model/resolved-session";
import { authenticationSessionSchema } from "../../interfaces/rest/schemas/authentication.schemas";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export class IamApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "IamApiError";
  }
}

export class IamApiGateway
  implements IamAuthenticationCommandService, IamAuthenticationQueryService
{
  async requestEmailSignIn(
    command: RequestEmailSignInCommand
  ): Promise<void> {
    await apiClient.post<void>(
      apiConfig.routes.authentication.signIn,
      { email: command.email.value },
      {
        errorMessage: "Authentication request failed",
        errorType: IamApiError,
      },
    );
  }

  async confirmEmailSignIn(
    command: ConfirmEmailSignInCommand
  ): Promise<AuthenticationSession> {
    const session = await apiClient.post<unknown>(
      apiConfig.routes.authentication.confirm,
      {
        email: command.email.value,
        code: command.code,
      },
      {
        errorMessage: "Authentication request failed",
        errorType: IamApiError,
      },
    );

    return authenticationSessionSchema.parse(session);
  }

  async refreshSession(
    command: RefreshSessionCommand
  ): Promise<AuthenticationSession> {
    const session = await apiClient.post<unknown>(
      apiConfig.routes.authentication.refresh,
      { refreshToken: command.refreshToken },
      {
        errorMessage: "Authentication request failed",
        errorType: IamApiError,
      },
    );

    return authenticationSessionSchema.parse(session);
  }

  async verifyAccessToken(accessToken: string): Promise<AccessTokenVerification> {
    try {
      await apiClient.request<void>(apiConfig.routes.authentication.verify, {
        token: accessToken,
        errorMessage: "Authentication verification failed",
        errorType: IamApiError,
      });
      return "authenticated";
    } catch (error) {
      if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
        return "unauthenticated";
      }
      return "unavailable";
    }
  }

  async signOut(command: SignOutCommand): Promise<void> {
    const headers: HeadersInit = {
      "X-Refresh-Token": command.refreshToken,
    };
    if (command.accessToken) {
      headers.Authorization = `Bearer ${command.accessToken}`;
    }

    await apiClient.delete<void>(apiConfig.routes.authentication.signOut, {
      headers,
      errorMessage: "Authentication request failed",
      errorType: IamApiError,
    });
  }

  async verifyMagicLink(
    command: VerifyMagicLinkCommand
  ): Promise<AuthenticationSession> {
    const session = await apiClient.request<unknown>(
      `${apiConfig.routes.authentication.magicLink}?token=${encodeURIComponent(command.token)}`,
      {
        errorMessage: "Authentication request failed",
        errorType: IamApiError,
      },
    );

    return authenticationSessionSchema.parse(session);
  }
}
