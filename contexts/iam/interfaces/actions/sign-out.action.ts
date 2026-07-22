"use server";

import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { signOutSchema } from "../rest/schemas/sign-out.schema";

export type SignOutActionResult =
  | { status: "success"; error: null }
  | { status: "error"; error: string };

export async function signOutAction(
  accessToken: string,
  refreshToken: string
): Promise<SignOutActionResult> {
  const input = signOutSchema.safeParse({ accessToken, refreshToken });

  if (!input.success) {
    return { status: "error", error: "Authentication tokens are missing" };
  }

  try {
    await createIamAuthenticationCommandService().signOut(input.data);
    return { status: "success", error: null };
  } catch (error) {
    console.error("Sign out failed", error);
    return {
      status: "error",
      error: "Unable to sign out. Please try again.",
    };
  }
}
