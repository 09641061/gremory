import { cookies } from "next/headers";
import Link from "next/link";
import { connection } from "next/server";
import { MailX } from "lucide-react";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { AcceptInvitationView } from "@/contexts/workforce/interfaces/components/accept-invitation-view";
import { InvitationAcceptAuthView } from "@/contexts/workforce/interfaces/components/invitation-accept-auth-view";
import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

export const instant = false;

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  // Request-time only: the screen depends on the caller's session cookie, the
  // token query, and a live public preview. Waiting for the incoming request
  // stops prerendering from touching time or session state before it renders.
  await connection();

  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken?.trim() ? rawToken.trim() : null;

  if (!token) return <InvitationErrorCard />;

  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (accessToken) return <AcceptInvitationView token={token} />;

  // Public preview: it lets a brand-new visitor see which organization invited
  // them, and which email must be used to register, without a session.
  const preview = await new WorkforceApiGateway()
    .previewInvitation(token)
    .catch(() => null);

  if (!preview || preview.status !== "PENDING") return <InvitationErrorCard />;

  return (
    <InvitationAcceptAuthView
      organizationName={preview.organizationName}
      invitedEmail={preview.invitedEmail}
      returnTo={`/invitations/accept?token=${encodeURIComponent(token)}`}
    />
  );
}

async function InvitationErrorCard() {
  const { onboarding, auth } = await getServerDictionary();

  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <section className="mx-auto w-full max-w-[440px]">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MailX className="size-6" aria-hidden="true" />
            </div>
            <h1 className="page-title">{onboarding.invitationTitle}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {onboarding.invitationUnavailable}
            </p>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              {auth.continueToTakodu}
            </Link>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
