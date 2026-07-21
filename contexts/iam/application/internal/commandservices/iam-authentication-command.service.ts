import type {
  AuthenticationSession,
} from '../../../domain/model/entities/authentication-session'
import type {
  ConfirmEmailSignInCommand,
  RefreshSessionCommand,
  RequestEmailSignInCommand,
  SignOutCommand,
  VerifyMagicLinkCommand,
} from '../../../domain/model/commands/authentication.commands'

export interface IamAuthenticationCommandService {
  requestEmailSignIn(command: RequestEmailSignInCommand): Promise<void>
  confirmEmailSignIn(command: ConfirmEmailSignInCommand): Promise<AuthenticationSession>
  verifyMagicLink(command: VerifyMagicLinkCommand): Promise<AuthenticationSession>
  refreshSession(command: RefreshSessionCommand): Promise<AuthenticationSession>
  signOut(command: SignOutCommand): Promise<void>
}
