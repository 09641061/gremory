import "server-only";

import { cookies } from "next/headers";
import { cacheLife, cacheTag } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createProfileQueryService } from "../../application/factory";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

export async function fetchMyProfileQuery(accessToken: string): Promise<ProfileViewModel | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("profile");

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
