"use server";

import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createEmail } from "../../domain/model/valueobjects/email";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { iamSessionCookies } from "../../infrastructure/session/iam-session-cookie";
import { confirmEmailSignInSchema } from "../rest/schemas/authentication.schemas";
import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";
import { normalizeAuthReturnPath } from "../../domain/model/valueobjects/auth-return-path";

export type ConfirmEmailSignInActionState =
  | { status: "idle"; error: null }
  | { status: "error"; error: string };

export async function confirmEmailSignInAction(
  _previousState: ConfirmEmailSignInActionState,
  formData: FormData
): Promise<ConfirmEmailSignInActionState> {
  let session: AuthenticationSession | null = null;
  const returnTo = normalizeAuthReturnPath(formData.get("returnTo"));

  try {
    const input = confirmEmailSignInSchema.parse({
      email: formData.get("email"),
      code: formData.getAll("code").join(""),
    });

    session = await createIamAuthenticationCommandService().confirmEmailSignIn({
      email: createEmail(input.email),
      code: input.code,
    });
    (await cookies()).delete(iamSessionCookies.pendingEmail);
  } catch (error) {
    console.error("Confirm email sign-in failed", error);
    return {
      status: "error",
      error: "Unable to verify the code. Check it and try again.",
    };
  }

  const callbackPath = returnTo
    ? `/auth/callback?next=${encodeURIComponent(returnTo)}`
    : "/auth/callback";
  redirect(
    `${callbackPath}#access_token=${encodeURIComponent(session!.accessToken)}&refresh_token=${encodeURIComponent(session!.refreshToken)}`
  );
}
