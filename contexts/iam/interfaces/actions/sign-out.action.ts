"use server";

import { cookies } from "next/headers";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { iamCookies } from "../cookies";
import { signOutSchema } from "../rest/schemas/sign-out.schema";

export type SignOutActionResult =
  | { status: "success"; error: null }
  | { status: "error"; error: string };

export async function signOutAction(): Promise<SignOutActionResult> {
  const cookieStore = await cookies();
  const input = signOutSchema.safeParse({
    accessToken: cookieStore.get(iamCookies.accessToken)?.value,
    refreshToken: cookieStore.get(iamCookies.refreshToken)?.value,
  });

  if (!input.success) {
    return { status: "error", error: "Authentication tokens are missing" };
  }

  try {
    await createIamAuthenticationCommandService().signOut(input.data);
    cookieStore.delete(iamCookies.accessToken);
    cookieStore.delete(iamCookies.refreshToken);
    cookieStore.delete(iamCookies.expiresIn);
    return { status: "success", error: null };
  } catch (error) {
    console.error("Sign out failed", error);
    return {
      status: "error",
      error: "Unable to sign out. Please try again.",
    };
  }
}
