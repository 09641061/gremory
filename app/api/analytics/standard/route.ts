import { cookies } from "next/headers";

import { standardAnalyticsRoute } from "@/contexts/analytics/interfaces/rest/routes/analytics.route";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value ?? null;
  const searchParams = new URL(request.url).searchParams;

  return standardAnalyticsRoute({
    accessToken,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
}
