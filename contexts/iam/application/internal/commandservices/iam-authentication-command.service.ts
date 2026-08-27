import "server-only";

import type { AuthenticationSession } from "../../../domain/model/entities/authentication-session";
import type { ConfirmEmailSignInCommand } from "../../../domain/model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../../../domain/model/commands/request-email-sign-in.command";
import type { RefreshSessionCommand } from "../../../domain/model/commands/refresh-session.command";
import type { SignOutCommand } from "../../../domain/model/commands/sign-out.command";
import type { VerifyMagicLinkCommand } from "../../../domain/model/commands/verify-magic-link.command";
import type { ExchangeGoogleCodeCommand } from "../../../domain/model/commands/exchange-google-code.command";
import type { IamAuthenticationCommandService } from "../../../domain/services/iam-authentication-command.service";
import { IamApiGateway } from "../../../infrastructure/gateways/iam-api.gateway";

export class IamAuthenticationCommandServiceImpl
  implements IamAuthenticationCommandService
{
  constructor(private readonly gateway: IamAuthenticationCommandService) {}

  requestEmailSignIn(command: RequestEmailSignInCommand): Promise<void> {
    return this.gateway.requestEmailSignIn(command);
  }

  confirmEmailSignIn(
    command: ConfirmEmailSignInCommand
  ): Promise<AuthenticationSession> {
    return this.gateway.confirmEmailSignIn(command);
  }

  refreshSession(command: RefreshSessionCommand): Promise<AuthenticationSession> {
    return this.gateway.refreshSession(command);
  }

  signOut(command: SignOutCommand): Promise<void> {
    return this.gateway.signOut(command);
  }

  verifyMagicLink(command: VerifyMagicLinkCommand) {
    return this.gateway.verifyMagicLink(command);
  }

  exchangeGoogleCode(command: ExchangeGoogleCodeCommand) {
    return this.gateway.exchangeGoogleCode(command);
  }
}

export function createIamAuthenticationCommandService() {
  return new IamAuthenticationCommandServiceImpl(new IamApiGateway());
}
