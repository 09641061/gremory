import "server-only";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { iamSessionCookies } from "../../infrastructure/session/iam-session-cookie";
import { VerifyForm } from "./verify-form";
import { normalizeAuthReturnPath, loginPath } from "../../domain/model/valueobjects/auth-return-path";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { getIamDictionary } from "../i18n";

export async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string; next?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get(iamSessionCookies.pendingEmail)?.value;
  const returnTo = normalizeAuthReturnPath(
    params.next ?? cookieStore.get(iamSessionCookies.returnTo)?.value,
  );
  const email = params.email ?? pendingEmail;

  if (!email && !params.token) redirect(loginPath(returnTo));

  if (params.token) {
    let session;

    try {
      session = await createIamAuthenticationCommandService().verifyMagicLink({
        token: params.token,
      });
    } catch (error) {
      console.error("Magic link verification failed", error);
      const locale = await getServerLocale();
      const iamDict = getIamDictionary(locale);
      return (
        <VerifyForm
          email={email ?? ""}
          returnTo={returnTo}
          initialError={iamDict.auth.invalidMagicLink}
        />
      );
    }

    const callbackPath = returnTo
      ? `/auth/callback?next=${encodeURIComponent(returnTo)}`
      : "/auth/callback";
    redirect(
      `${callbackPath}#access_token=${encodeURIComponent(session.accessToken)}&refresh_token=${encodeURIComponent(session.refreshToken)}`
    );
  }

  return <VerifyForm email={email ?? ""} returnTo={returnTo} />;
}
