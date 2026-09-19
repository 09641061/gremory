import { cookies } from "next/headers";
import Link from "next/link";
import { connection } from "next/server";
import { Link2Off } from "lucide-react";

import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { JoinShareableLinkView } from "@/contexts/workforce/interfaces/components/join-shareable-link-view";
import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

export const instant = false;

/**
 * Redeems a shareable, multi-use invitation link (`/invitations/join?token=...`). This is
 * the public URL the backend embeds in generated links. Anonymous visitors get a sign-in
 * / register prompt that returns here; authenticated visitors are joined immediately.
 */
export default async function JoinShareableLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  await connection();

  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken?.trim() ? rawToken.trim() : null;

  if (!token) return <JoinErrorCard />;

  const preview = await new WorkforceApiGateway()
    .previewShareableInvitationLink(token)
    .catch(() => null);
  if (!preview || preview.status !== "PENDING") return <JoinErrorCard />;

  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (accessToken) {
    return <JoinShareableLinkView token={token} organizationName={preview.organizationName} />;
  }

  return (
    <AuthForm
      returnTo={`/invitations/join?token=${encodeURIComponent(token)}`}
      heading={`Join ${preview.organizationName}`}
      description="Sign in or create your account to accept this invitation."
      submitLabel="Continue"
    />
  );
}

function JoinErrorCard() {
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <section className="mx-auto w-full max-w-[440px]">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Link2Off className="size-6" aria-hidden="true" />
            </div>
            <h1 className="page-title">Invitation link unavailable</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              This invitation link is missing, expired or no longer active. Ask an administrator to
              generate a new one.
            </p>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Continue to Takodu
            </Link>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
