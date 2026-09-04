"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Store } from "lucide-react";

import { acceptPendingInvitationAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import { initialTeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { buildInvitationLandingHref } from "./invitation-navigation";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

export type PendingInvitationView = Readonly<{
  establishmentId: string;
  organizationName: string;
  establishmentName: string;
  expiresAt: string;
}>;

/**
 * Shown to an account that registered through an invitation it never accepted.
 * Accepting needs no token: the backend resolves the invitation by the
 * authenticated account's email.
 */
export function PendingInvitationView({ invitation }: { invitation: PendingInvitationView }) {
  const { t } = useWorkforceTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(acceptPendingInvitationAction, initialTeamActionResult);

  useEffect(() => {
    if (state.status === "success") {
      router.replace(buildInvitationLandingHref(invitation.establishmentId));
    }
  }, [invitation.establishmentId, router, state.status]);

  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardTitle>{t.invitations.pendingTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6 pt-0">
            <div className="space-y-3 text-sm text-foreground">
              <p className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                {invitation.organizationName}
              </p>
              <p className="flex items-center gap-2">
                <Store className="size-4 text-muted-foreground" />
                {invitation.establishmentName}
              </p>
              <p className="text-muted-foreground">
                {t.invitations.pendingExpiresOn.replace("{date}", new Date(invitation.expiresAt).toLocaleDateString())}
              </p>
            </div>

            {state.status === "error" ? (
              <ErrorAlert title={t.invitations.unableToAccept} message={state.error ?? undefined} />
            ) : null}

            <form action={formAction}>
              <Button type="submit" disabled={pending} className="w-full gap-2">
                {pending ? <Spinner className="size-4" /> : <Check className="size-4" />}
                {pending ? t.invitations.accepting : t.invitations.acceptInvitation}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}

export function NoPendingInvitationView() {
  const { t } = useWorkforceTranslations();
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardTitle>{t.invitations.noPendingTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t.invitations.noPendingMessage}
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}
