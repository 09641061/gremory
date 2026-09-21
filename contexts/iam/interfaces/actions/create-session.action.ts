"use server";

import "server-only";
import { cookies } from "next/headers";

import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { authenticationSessionSchema } from "@/contexts/iam/interfaces/rest/schemas/authentication.schemas";

/**
 * Persists an `AuthenticationSession` to the HTTP-only session cookies after
 * validating it with the runtime schema. Tokens are rejected when malformed
 * or empty so a stray 200 OK from the backend cannot leak into the session.
 *
 * Workspace-selection cookies are cleared so the previous account's tenant
 * does not bleed into onboarding or the next user's resolution.
 */
export async function createSessionAction(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  const session = authenticationSessionSchema.parse({
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
  });

  const cookieStore = await cookies();
  cookieStore.set(iamSessionCookies.accessToken, session.accessToken, iamSessionCookieOptions);
  cookieStore.set(iamSessionCookies.refreshToken, session.refreshToken, iamSessionCookieOptions);

  // Workspace context belongs to the previous account/session and must never
  // leak into onboarding or the next user's tenant resolution.
  cookieStore.delete(workspaceSelectionCookies.establishmentId);
  cookieStore.delete(iamSessionCookies.returnTo);
  cookieStore.delete(workspaceSelectionCookies.organizationId);
  cookieStore.delete(workspaceSelectionCookies.previewOrganizationId);
}
