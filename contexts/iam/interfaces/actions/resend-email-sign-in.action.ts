"use server";

import { sendSignInEmail } from "./request-email-sign-in.action";
import { requestEmailSignInSchema } from "../rest/schemas/authentication.schemas";
import { normalizeAuthReturnPath } from "../../domain/model/valueobjects/auth-return-path";

export type ResendEmailSignInActionState =
  | { status: "idle" | "success"; error: null }
  | { status: "error"; error: string };

export async function resendEmailSignInAction(
  _previousState: ResendEmailSignInActionState,
  formData: FormData
): Promise<ResendEmailSignInActionState> {
  try {
    const input = requestEmailSignInSchema.parse({
      email: formData.get("email"),
    });

    await sendSignInEmail(
      input.email,
      normalizeAuthReturnPath(formData.get("returnTo")),
    );
    return { status: "success", error: null };
  } catch (error) {
    console.error("Resend email sign-in failed", error);
    return {
      status: "error",
      error: "Unable to resend the sign-in email. Please try again.",
    };
  }
}
