"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import "server-only";
import { cookies } from "next/headers";
import { composeIamAdapters } from "../server/iam-composition";
import { iamSessionCookies } from "../../infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { signOutSchema } from "../rest/schemas/sign-out.schema";

export type SignOutActionResult =
  | { status: "success"; error: null }
  | { status: "error"; error: string };

export async function signOutAction(): Promise<SignOutActionResult> {
  const cookieStore = await cookies();
  const input = signOutSchema.safeParse({
    accessToken: cookieStore.get(iamSessionCookies.accessToken)?.value,
    refreshToken: cookieStore.get(iamSessionCookies.refreshToken)?.value,
  });

  if (!input.success) {
    return { status: "error", error: "Authentication tokens are missing" };
  }

  try {
    await composeIamAdapters().authenticationWriter.signOut(input.data);
    cookieStore.delete(iamSessionCookies.accessToken);
    cookieStore.delete(iamSessionCookies.refreshToken);
    cookieStore.delete(workspaceSelectionCookies.organizationId);
    cookieStore.delete(workspaceSelectionCookies.establishmentId);
    cookieStore.delete(workspaceSelectionCookies.previewOrganizationId);
    return { status: "success", error: null };
  } catch (error) {
    recordSafely("iam.sign.out.action", { cause: error });
    return {
      status: "error",
      error: "Unable to sign out. Please try again.",
    };
  }
}
