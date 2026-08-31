import "server-only";

import { getBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";

export async function getTeamAccessToken(
  providedToken?: string,
): Promise<string | undefined> {
  if (providedToken) return providedToken;
  return getBusinessAccessToken();
}

export async function requireTeamAccessToken(
  providedToken?: string,
): Promise<string> {
  const token = await getTeamAccessToken(providedToken);
  if (!token) throw new Error("Authentication is required");
  return token;
}
