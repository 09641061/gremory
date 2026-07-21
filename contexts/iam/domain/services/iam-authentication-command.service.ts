import type { AuthenticationSession } from "../model/entities/authentication-session";
import type { ConfirmEmailSignInCommand } from "../model/commands/confirm-email-sign-in.command";
import type { RequestEmailSignInCommand } from "../model/commands/request-email-sign-in.command";

export interface IamAuthenticationCommandService {
  requestEmailSignIn(command: RequestEmailSignInCommand): Promise<void>;
  confirmEmailSignIn(
    command: ConfirmEmailSignInCommand
  ): Promise<AuthenticationSession>;
}
