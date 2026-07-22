import "server-only";

import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";
import type { IamAuthenticationCommandService } from "../../domain/services/iam-authentication-command.service";
import type { ConfirmEmailSignInCommand } from "../../domain/model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../../domain/model/commands/request-email-sign-in.command";
import type { RefreshSessionCommand } from "../../domain/model/commands/refresh-session.command";
import type { SignOutCommand } from "../../domain/model/commands/sign-out.command";
import type { VerifyMagicLinkCommand } from "../../domain/model/commands/verify-magic-link.command";
import { authenticationSessionSchema } from "../../interfaces/rest/schemas/authentication.schemas";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export class IamApiGateway implements IamAuthenticationCommandService {
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
      throw new Error(await readError(response));
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
      throw new Error(await readError(response));
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
      throw new Error(await readError(response));
    }

    return authenticationSessionSchema.parse(await response.json());
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
      throw new Error(await readError(response));
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
      throw new Error(await readError(response));
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
