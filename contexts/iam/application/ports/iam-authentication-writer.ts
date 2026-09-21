import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";
import type { ConfirmEmailSignInCommand } from "../../domain/model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../../domain/model/commands/request-email-sign-in.command";
import type { RefreshSessionCommand } from "../../domain/model/commands/refresh-session.command";
import type { SignOutCommand } from "../../domain/model/commands/sign-out.command";
import type { VerifyMagicLinkCommand } from "../../domain/model/commands/verify-magic-link.command";
import type { ExchangeGoogleCodeCommand } from "../../domain/model/commands/exchange-google-code.command";

/**
 * Server-only contract for IAM mutation flows. Implementations live in
 * Infrastructure; Application receives this port via composition. The
 * composition layer is responsible for forwarding actor/tenant/correlation
 * from the request-scoped context.
 */
export interface IamAuthenticationWriter {
  requestEmailSignIn(command: RequestEmailSignInCommand): Promise<void>;
  confirmEmailSignIn(command: ConfirmEmailSignInCommand): Promise<AuthenticationSession>;
  refreshSession(command: RefreshSessionCommand): Promise<AuthenticationSession>;
  signOut(command: SignOutCommand): Promise<void>;
  exchangeGoogleCode(command: ExchangeGoogleCodeCommand): Promise<AuthenticationSession>;
  verifyMagicLink(command: VerifyMagicLinkCommand): Promise<AuthenticationSession>;
}
