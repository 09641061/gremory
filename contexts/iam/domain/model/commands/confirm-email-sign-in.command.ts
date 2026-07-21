import type { Email } from "../valueobjects/email";

export type ConfirmEmailSignInCommand = Readonly<{
  email: Email;
  code: string;
}>;
