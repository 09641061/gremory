"use server";

import { redirect } from "next/navigation";
import { createEmail } from "../../domain/model/valueobjects/email";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { requestEmailSignInSchema } from "../rest/schemas/authentication.schemas";

export async function requestEmailSignInAction(formData: FormData) {
  const input = requestEmailSignInSchema.parse({
    email: formData.get("email"),
  });

  await createIamAuthenticationCommandService().requestEmailSignIn({
    email: createEmail(input.email),
  });

  redirect(`/verify?email=${encodeURIComponent(input.email)}`);
}
