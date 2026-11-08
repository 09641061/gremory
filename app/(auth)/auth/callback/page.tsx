import { AuthCallback } from "@/contexts/iam/interfaces/components/auth-callback";
import { cookies } from "next/headers";
import { normalizeAuthReturnPath } from "@/contexts/iam/domain/model/valueobjects/auth-return-path";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

// OAuth callback inputs are request-bound (URL search params and the returnTo
// cookie), so this route must wait for the request instead of instant render.
export const instant = false;

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = (await searchParams).next;
  const cookieReturnTo = (await cookies()).get(iamSessionCookies.returnTo)?.value;
  const returnTo = normalizeAuthReturnPath(
    (Array.isArray(next) ? next[0] : next) ?? cookieReturnTo,
  );
  return <AuthCallback returnTo={returnTo} />;
}
