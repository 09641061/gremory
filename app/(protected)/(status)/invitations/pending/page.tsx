import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Building2, MailOpen } from "lucide-react";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { AcceptPendingInvitationButton } from "@/contexts/notifications/interfaces/components/accept-pending-invitation-button";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";

export default async function PendingInvitationPage() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const workspace = await createBusinessWorkspaceQueryService()
    .getHeaderViewModel()
    .catch(() => null);
  if (!workspace || workspace.accountType !== "PENDING_INVITATION") {
    redirect("/");
  }

  const dictionary = await getServerDictionary();
  const invitation = workspace.pendingInvitation;

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-lg overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 px-6 py-7 sm:px-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <MailOpen className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">
              {dictionary.onboarding.invitationTitle}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {dictionary.onboarding.invitationDescription}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-7 sm:px-8">
          {invitation ? (
            <dl className="grid gap-4 rounded-xl border border-border/60 bg-background p-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">{dictionary.onboarding.invitationOrganization}</dt>
                  <dd className="mt-1 font-medium text-foreground">{invitation.organizationName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">{dictionary.onboarding.invitationEstablishment}</dt>
                  <dd className="mt-1 font-medium text-foreground">{invitation.establishmentName}</dd>
                </div>
              </div>
            </dl>
          ) : (
            <p className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              {dictionary.onboarding.invitationUnavailable}
            </p>
          )}
          <AcceptPendingInvitationButton />
        </CardContent>
      </Card>
    </section>
  );
}
