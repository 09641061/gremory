import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

/**
 * Plain access-token read shared by contexts whose Server Actions don't need
 * the refresh/rotation flow that `requireBusinessAccessToken` performs (which
 * also resolves an expired access token from the refresh token). Contexts that
 * do need rotation-aware resolution should keep using that richer flow instead
 * of this one.
 */
export async function requireIamAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    throw new Error("Authentication is required");
  }

  return accessToken;
}
