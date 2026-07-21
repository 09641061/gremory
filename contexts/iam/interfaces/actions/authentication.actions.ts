'use server'

import { createEmail } from '../../domain/model/valueobjects/email'
import type { AuthenticationSession } from '../../domain/model/entities/authentication-session'
import { iamApiGateway, authenticationError } from '../../infrastructure/gateways/iam-api.gateway'
import {
  confirmEmailSchema,
  emailSchema,
  magicLinkSchema,
  refreshSchema,
} from '../rest/schemas/authentication.schemas'

export type AuthenticationActionState = Readonly<{
  status: 'idle' | 'success' | 'error'
  message: string | null
  session: AuthenticationSession | null
}>

export const initialAuthenticationActionState: AuthenticationActionState = {
  status: 'idle',
  message: null,
  session: null,
}

function errorState(error: unknown): AuthenticationActionState {
  return { status: 'error', message: authenticationError(error), session: null }
}

export async function requestEmailSignInAction(
  _previous: AuthenticationActionState,
  formData: FormData,
): Promise<AuthenticationActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return errorState(new Error(parsed.error.issues[0]?.message ?? 'Invalid email.'))

  try {
    const email = createEmail(parsed.data.email)
    const response = await iamApiGateway.requestEmailSignIn(email.value)
    return { status: 'success', message: response.message, session: null }
  } catch (error) {
    return errorState(error)
  }
}

export async function confirmEmailSignInAction(
  _previous: AuthenticationActionState,
  formData: FormData,
): Promise<AuthenticationActionState> {
  const parsed = confirmEmailSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  })
  if (!parsed.success) return errorState(new Error(parsed.error.issues[0]?.message ?? 'Invalid code.'))

  try {
    const email = createEmail(parsed.data.email)
    const session = await iamApiGateway.confirmEmailSignIn(email.value, parsed.data.code)
    return { status: 'success', message: 'Your session is active.', session }
  } catch (error) {
    return errorState(error)
  }
}

export async function verifyMagicLinkAction(token: string) {
  const parsed = magicLinkSchema.safeParse({ token })
  if (!parsed.success) return errorState(new Error(parsed.error.issues[0]?.message ?? 'Invalid link.'))

  try {
    return { status: 'success' as const, message: 'Your session is active.', session: await iamApiGateway.verifyMagicLink(parsed.data.token) }
  } catch (error) {
    return errorState(error)
  }
}

export async function refreshSessionAction(refreshToken: string) {
  const parsed = refreshSchema.safeParse({ refreshToken })
  if (!parsed.success) return errorState(new Error('Your session has expired.'))

  try {
    return { status: 'success' as const, message: 'Session refreshed.', session: await iamApiGateway.refreshSession(parsed.data.refreshToken) }
  } catch (error) {
    return errorState(error)
  }
}

export async function signOutAction(accessToken?: string, refreshToken?: string) {
  try {
    await iamApiGateway.signOut({ accessToken, refreshToken })
  } catch {
    // Local credentials are removed even if the remote session already expired.
  }
  return { status: 'success' as const, message: 'Signed out.', session: null }
}
