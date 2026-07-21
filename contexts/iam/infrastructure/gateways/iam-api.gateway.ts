import 'server-only'

import type { AuthenticationSession } from '../../domain/model/entities/authentication-session'

type SignInResponse = Readonly<{ message: string }>

export interface IamApiGateway {
  requestEmailSignIn(email: string): Promise<SignInResponse>
  confirmEmailSignIn(email: string, code: string): Promise<AuthenticationSession>
  verifyMagicLink(token: string): Promise<AuthenticationSession>
  refreshSession(refreshToken: string): Promise<AuthenticationSession>
  signOut(tokens: { accessToken?: string; refreshToken?: string }): Promise<void>
}

class IamApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

function apiUrl(path: string) {
  const baseUrl = process.env.IAM_API_URL ?? 'http://localhost:8080'
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
    cache: 'no-store',
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new IamApiError(response.status, payload?.message ?? 'We could not complete the request.')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const iamApiGateway: IamApiGateway = {
  requestEmailSignIn(email) {
    return request<SignInResponse>('/api/v1/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },
  confirmEmailSignIn(email, code) {
    return request<AuthenticationSession>('/api/v1/auth/confirm', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  },
  verifyMagicLink(token) {
    return request<AuthenticationSession>(`/api/v1/auth/magic-link?token=${encodeURIComponent(token)}`)
  },
  refreshSession(refreshToken) {
    return request<AuthenticationSession>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },
  signOut({ accessToken, refreshToken }) {
    return request<void>('/api/v1/auth/sign-out', {
      method: 'DELETE',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(refreshToken ? { 'X-Refresh-Token': refreshToken } : {}),
      },
    })
  },
}

export function authenticationError(error: unknown) {
  if (error instanceof IamApiError && error.status === 429) {
    return 'Too many attempts. Wait a moment and try again.'
  }

  if (error instanceof IamApiError && error.status === 503) {
    return 'The email service is unavailable. Try again in a few minutes.'
  }

  if (error instanceof Error) return error.message
  return 'An unexpected error occurred. Try again.'
}
