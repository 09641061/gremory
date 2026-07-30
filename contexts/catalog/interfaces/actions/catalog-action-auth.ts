import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function requireCatalogAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    throw new Error("Authentication is required");
  }

  return accessToken;
}
