import type { AuthenticationSession } from "../model/entities/authentication-session";
import type { ConfirmEmailSignInCommand } from "../model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../model/commands/request-email-sign-in.command";
import type { RefreshSessionCommand } from "../model/commands/refresh-session.command";
import type { SignOutCommand } from "../model/commands/sign-out.command";
import type { VerifyMagicLinkCommand } from "../model/commands/verify-magic-link.command";
import type { ExchangeGoogleCodeCommand } from "../model/commands/exchange-google-code.command";

export interface IamAuthenticationCommandService {
  requestEmailSignIn(command: RequestEmailSignInCommand): Promise<void>;
  confirmEmailSignIn(
    command: ConfirmEmailSignInCommand
  ): Promise<AuthenticationSession>;
  refreshSession(command: RefreshSessionCommand): Promise<AuthenticationSession>;
  signOut(command: SignOutCommand): Promise<void>;
  verifyMagicLink(command: VerifyMagicLinkCommand): Promise<AuthenticationSession>;
  exchangeGoogleCode(command: ExchangeGoogleCodeCommand): Promise<AuthenticationSession>;
}
