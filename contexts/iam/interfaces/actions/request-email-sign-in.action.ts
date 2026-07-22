"use server";

import { redirect } from "next/navigation";
import { createEmail } from "../../domain/model/valueobjects/email";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { requestEmailSignInSchema } from "../rest/schemas/authentication.schemas";

export type RequestEmailSignInActionState =
  | { status: "idle"; error: null }
  | { status: "error"; error: string };

export async function requestEmailSignInAction(
  _previousState: RequestEmailSignInActionState,
  formData: FormData
): Promise<RequestEmailSignInActionState> {
  let email: string;

  try {
    const input = requestEmailSignInSchema.parse({
      email: formData.get("email"),
    });
    email = input.email;

    await createIamAuthenticationCommandService().requestEmailSignIn({
      email: createEmail(input.email),
    });

  } catch (error) {
    console.error("Request email sign-in failed", error);
    return {
      status: "error",
      error: "Unable to send the sign-in email. Please try again.",
    };
  }

  redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
}
