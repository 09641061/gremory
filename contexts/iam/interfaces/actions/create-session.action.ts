"use server";

import "server-only";
import { cookies } from "next/headers";

import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";

export async function createSessionAction(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(iamSessionCookies.accessToken, input.accessToken, iamSessionCookieOptions);
  cookieStore.set(iamSessionCookies.refreshToken, input.refreshToken, iamSessionCookieOptions);
  // Workspace context belongs to the previous account/session and must never
  // leak into onboarding or the next user's tenant resolution.
  cookieStore.delete(workspaceSelectionCookies.establishmentId);
  cookieStore.delete(iamSessionCookies.returnTo);
}
