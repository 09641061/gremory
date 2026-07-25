import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function getBusinessAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  return (await cookies()).get(iamSessionCookies.accessToken)?.value;
}

export async function requireBusinessAccessToken(providedToken?: string): Promise<string> {
  const token = await getBusinessAccessToken(providedToken);
  if (!token) throw new Error("Authentication is required");
  return token;
}
