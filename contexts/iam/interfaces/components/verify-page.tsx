import { redirect } from "next/navigation";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { VerifyForm } from "./verify-form";

export async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const params = await searchParams;

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
          email={params.email ?? "email@example.com"}
          initialError="This sign-in link is invalid or has expired. Request a new one."
        />
      );
    }

    redirect(
      `/auth/callback#access_token=${encodeURIComponent(session.accessToken)}&refresh_token=${encodeURIComponent(session.refreshToken)}&expires_in=${session.expiresIn}`
    );
  }

  return <VerifyForm email={params.email ?? "email@example.com"} />;
}
