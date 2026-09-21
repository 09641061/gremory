import "server-only";

import { cookies } from "next/headers";
import { composeIamAdapters } from "@/contexts/iam/interfaces/server/iam-composition";
import {
  iamSessionCookieMaxAge,
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function getBusinessAccessToken(providedToken?: string): Promise<string | undefined> {
  // Proxy requests already resolved IAM and pass the authoritative token. Do
  // not touch request cookies or resolve IAM a second time in that path.
  if (providedToken) return providedToken;
  const cookieStore = await cookies();
  const accessToken = providedToken ?? cookieStore?.get(iamSessionCookies.accessToken)?.value;
  const refreshToken = cookieStore?.get(iamSessionCookies.refreshToken)?.value;

  if (!accessToken && !refreshToken) return undefined;

  const session = await composeIamAdapters().sessionQueryService.resolveSession({
    accessToken,
    refreshToken,
  });

  switch (session.status) {
    case "authenticated":
      if (session.rotatedSession && cookieStore) {
        persistSessionCookies(cookieStore, session.rotatedSession.accessToken, session.rotatedSession.refreshToken);
      }
      return session.accessToken;
    case "unavailable":
      return accessToken;
    case "unauthenticated":
      return undefined;
  }
}

export async function requireBusinessAccessToken(providedToken?: string): Promise<string> {
  const token = await getBusinessAccessToken(providedToken);
  if (!token) throw new Error("Authentication is required");
  return token;
}

function persistSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  accessToken: string,
  refreshToken: string,
) {
  cookieStore.set(iamSessionCookies.accessToken, accessToken, {
    ...iamSessionCookieOptions,
    maxAge: iamSessionCookieMaxAge.accessToken,
  });
  cookieStore.set(iamSessionCookies.refreshToken, refreshToken, {
    ...iamSessionCookieOptions,
    maxAge: iamSessionCookieMaxAge.refreshToken,
  });
}
