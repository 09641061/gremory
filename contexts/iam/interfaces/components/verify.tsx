import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { iamSessionCookies } from "../../infrastructure/session/iam-session-cookie";
import { VerifyForm } from "./verify-form";

export async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const params = await searchParams;
  const pendingEmail = (await cookies()).get(iamSessionCookies.pendingEmail)?.value;
  const email = params.email ?? pendingEmail;

  if (!email && !params.token) redirect("/login");

  if (params.token) {
    let session;

    try {
      session = await createIamAuthenticationCommandService().verifyMagicLink({
        token: params.token,
      });
    } catch (error) {
      console.error("Magic link verification failed", error);
      return (
        <VerifyForm
          email={email ?? ""}
          initialError="This sign-in link is invalid or has expired. Request a new one."
        />
      );
    }

    redirect(
      `/auth/callback#access_token=${encodeURIComponent(session.accessToken)}&refresh_token=${encodeURIComponent(session.refreshToken)}`
    );
  }

  return <VerifyForm email={email ?? ""} />;
}
