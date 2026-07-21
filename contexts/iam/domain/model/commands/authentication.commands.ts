import type { Email } from '../valueobjects/email'

export type RequestEmailSignInCommand = Readonly<{
  email: Email
}>

export type ConfirmEmailSignInCommand = Readonly<{
  email: Email
  code: string
}>

export type VerifyMagicLinkCommand = Readonly<{
  token: string
}>

export type RefreshSessionCommand = Readonly<{
  refreshToken: string
}>

export type SignOutCommand = Readonly<{
  accessToken?: string
  refreshToken?: string
}>
