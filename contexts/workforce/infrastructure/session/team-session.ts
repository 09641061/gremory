import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function getTeamAccessToken(
  providedToken?: string,
): Promise<string | undefined> {
  if (providedToken) return providedToken;
  return (await cookies()).get(iamSessionCookies.accessToken)?.value;
}

export async function requireTeamAccessToken(
  providedToken?: string,
): Promise<string> {
  const token = await getTeamAccessToken(providedToken);
  if (!token) throw new Error("Authentication is required");
  return token;
}
