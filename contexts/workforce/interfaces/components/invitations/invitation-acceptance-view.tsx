"use client";

import Link from "next/link";
import { Building2, Check, Mail, Store, Users } from "lucide-react";
import { useActionState, useEffect } from "react";
import type { TeamInvitationPreviewView } from "@/contexts/workforce/application/model/team.read-models";
import { acceptTeamInvitationAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import { initialTeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function InvitationAcceptanceView({
  token,
  invitation,
  authenticated,
}: {
  token: string;
  invitation: TeamInvitationPreviewView;
  authenticated: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    acceptTeamInvitationAction,
    initialTeamActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      window.location.assign("/");
    }
  }, [state.status]);

  if (state.status === "success") {
    return <InvitationAcceptedView redirecting />;
  }

  if (invitation.status === "REMOVED") {
    return (
      <InvitationShell>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Users className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Workspace access removed</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your membership is no longer active. Ask the organization owner to send you a new invitation.
        </p>
      </InvitationShell>
    );
  }

  if (invitation.status === "ACCEPTED") {
    return <InvitationAcceptedView />;
  }

  const returnTo = `/invitations/accept?${new URLSearchParams({ token })}`;
  const signInPath = `/login?next=${encodeURIComponent(returnTo)}`;

  return (
    <InvitationShell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Join the team</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        You have been invited to join this workspace.
      </p>

      <Card className="mt-6 gap-0 rounded-lg border border-border py-0 text-left shadow-none ring-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="flex items-center gap-3">
            <Building2 className="size-4 text-muted-foreground" />
            <span>{invitation.organizationName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 py-4 text-sm">
          <p className="flex items-center gap-3">
            <Store className="size-4 text-muted-foreground" />
            <span>{invitation.establishmentName}</span>
          </p>
        </CardContent>
      </Card>

      <ErrorAlert
        title="Invitation error"
        message={state.status === "error" ? state.error : undefined}
      />

      {authenticated ? (
        <form action={formAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                Accepting...
              </>
            ) : (
              "Accept invitation"
            )}
          </Button>
        </form>
      ) : (
        <Link href={signInPath} className={buttonVariants({ className: "mt-6 w-full" })}>
          Sign in to accept
        </Link>
      )}
    </InvitationShell>
  );
}

function InvitationAcceptedView({ redirecting = false }: { redirecting?: boolean }) {
  return (
    <InvitationShell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Invitation accepted</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {redirecting
          ? "Redirecting you to Takodu..."
          : "You already have access to this workspace."}
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6 w-full" })}>
        Continue to Takodu
      </Link>
    </InvitationShell>
  );
}

export function InvitationExpiredView() {
  return (
    <InvitationShell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Mail className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Invitation expired</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        This invitation has expired and is no longer available.
      </p>
    </InvitationShell>
  );
}

export function InvitationUnavailableView() {
  return (
    <InvitationShell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Mail className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Invitation unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        This invitation is invalid or no longer available.
      </p>
    </InvitationShell>
  );
}

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <Card className="w-full max-w-[440px] rounded-xl border-border bg-card shadow-sm">
        <CardContent className="p-7 text-center">{children}</CardContent>
      </Card>
    </main>
  );
}
