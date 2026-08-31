"use server";

import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createEmail } from "../../domain/model/valueobjects/email";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "../../infrastructure/session/iam-session-cookie";
import { requestEmailSignInSchema } from "../rest/schemas/authentication.schemas";
import { normalizeAuthReturnPath } from "../../domain/model/valueobjects/auth-return-path";

export type RequestEmailSignInActionState =
  | { status: "idle"; error: null }
  | { status: "error"; error: string };

export async function requestEmailSignInAction(
  _previousState: RequestEmailSignInActionState,
  formData: FormData
): Promise<RequestEmailSignInActionState> {
  let email: string;
  const returnTo = normalizeAuthReturnPath(formData.get("returnTo"));

  try {
    const input = requestEmailSignInSchema.parse({
      email: formData.get("email"),
    });
    email = input.email;

    await sendSignInEmail(input.email, returnTo);

  } catch (error) {
    console.error("Request email sign-in failed", error);
    return {
      status: "error",
      error: "Unable to send the sign-in email. Please try again.",
    };
  }

  const params = new URLSearchParams({ email });
  if (returnTo) params.set("next", returnTo);
  redirect(`/auth/verify?${params}`);
}

export async function sendSignInEmail(email: string, returnTo: string | null = null) {
  await createIamAuthenticationCommandService().requestEmailSignIn({
    email: createEmail(email),
  });

  const cookieStore = await cookies();
  cookieStore.set(iamSessionCookies.pendingEmail, email, {
    ...iamSessionCookieOptions,
    maxAge: 60 * 10,
  });
  if (returnTo) {
    cookieStore.set(iamSessionCookies.returnTo, returnTo, {
      ...iamSessionCookieOptions,
      maxAge: 60 * 10,
    });
  }
}
