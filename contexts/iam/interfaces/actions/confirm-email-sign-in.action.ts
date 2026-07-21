"use server";

import { redirect } from "next/navigation";
import { createEmail } from "../../domain/model/valueobjects/email";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { confirmEmailSignInSchema } from "../rest/schemas/authentication.schemas";

export async function confirmEmailSignInAction(formData: FormData) {
  const input = confirmEmailSignInSchema.parse({
    email: formData.get("email"),
    code: formData.getAll("code").join(""),
  });

  const session = await createIamAuthenticationCommandService().confirmEmailSignIn({
    email: createEmail(input.email),
    code: input.code,
  });

  redirect(
    `/callback#access_token=${encodeURIComponent(session.accessToken)}&refresh_token=${encodeURIComponent(session.refreshToken)}&expires_in=${session.expiresIn}`
  );
}
