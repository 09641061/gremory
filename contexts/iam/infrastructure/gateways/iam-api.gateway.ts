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

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export class IamApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "IamApiError";
  }
}

export class IamApiGateway
  implements IamAuthenticationCommandService, IamAuthenticationQueryService
{
  async requestEmailSignIn(
    command: RequestEmailSignInCommand
  ): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: command.email.value }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new IamApiError(await readError(response), response.status);
    }
  }

  async confirmEmailSignIn(
    command: ConfirmEmailSignInCommand
  ): Promise<AuthenticationSession> {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: command.email.value,
        code: command.code,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new IamApiError(await readError(response), response.status);
    }

    return authenticationSessionSchema.parse(await response.json());
  }

  async refreshSession(
    command: RefreshSessionCommand
  ): Promise<AuthenticationSession> {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: command.refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new IamApiError(await readError(response), response.status);
    }

    return authenticationSessionSchema.parse(await response.json());
  }

  async verifyAccessToken(accessToken: string): Promise<AccessTokenVerification> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/verify`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      if (response.status === 400 || response.status === 401) {
        return "unauthenticated";
      }
      return response.ok ? "authenticated" : "unavailable";
    } catch {
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

    const response = await fetch(`${apiBaseUrl}/api/v1/auth/sign-out`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new IamApiError(await readError(response), response.status);
    }
  }

  async verifyMagicLink(
    command: VerifyMagicLinkCommand
  ): Promise<AuthenticationSession> {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/auth/magic-link?token=${encodeURIComponent(command.token)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new IamApiError(await readError(response), response.status);
    }

    return authenticationSessionSchema.parse(await response.json());
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? "Authentication request failed";
  } catch {
    return "Authentication request failed";
  }
}
