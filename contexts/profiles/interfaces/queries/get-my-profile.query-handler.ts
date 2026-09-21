import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createProfileQueryService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

/**
 * Profile data is bearer-token-derived and must remain request-scoped. Do not
 * put it in a persistent/shared Cache Components cache.
 */
export async function fetchMyProfileQuery(accessToken: string): Promise<ProfileViewModel | null> {
  const queryService = createProfileQueryService();
  return queryService.getMyProfile({}, accessToken);
}

export async function getMyProfileServerQuery(): Promise<ProfileViewModel | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return null;
  }

  return fetchMyProfileQuery(accessToken);
}
