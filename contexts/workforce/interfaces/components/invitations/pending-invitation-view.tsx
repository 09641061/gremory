"use client";

import { Building2, Check, Store } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptPendingInvitationAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import { initialTeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { buildInvitationLandingHref } from "./invitation-navigation";

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
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    acceptPendingInvitationAction,
    initialTeamActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.replace(buildInvitationLandingHref(invitation.establishmentId));
    }
  }, [invitation.establishmentId, router, state.status]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You have been invited</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              <Building2 className="size-4 text-muted-foreground" />
              {invitation.organizationName}
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Store className="size-4 text-muted-foreground" />
              {invitation.establishmentName}
            </p>
            <p className="text-muted-foreground">
              This invitation expires on{" "}
              {new Date(invitation.expiresAt).toLocaleDateString()}.
            </p>
          </div>

          {state.status === "error" && (
            <ErrorAlert title="Unable to accept invitation" message={state.error ?? undefined} />
          )}

          <form action={formAction}>
            <Button type="submit" disabled={pending} className="w-full gap-2">
              {pending ? <Spinner className="size-4" /> : <Check className="size-4" />}
              {pending ? "Accepting..." : "Accept invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export function NoPendingInvitationView() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No invitation waiting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The invitation for this account is no longer available. Ask whoever invited you
          to send a new one.
        </CardContent>
      </Card>
    </main>
  );
}
