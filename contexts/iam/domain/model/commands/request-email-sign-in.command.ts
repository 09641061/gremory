import type { Email } from "../valueobjects/email";

export type RequestEmailSignInCommand = Readonly<{
  email: Email;
}>;
