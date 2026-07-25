"use client";

import Link from "next/link";
import { Check, Mail, MapPin, Users } from "lucide-react";
import { useActionState } from "react";
import type { TeamInvitationPreviewView } from "../../application/model/team.read-models";
import { acceptTeamInvitationAction } from "../actions/team.actions";
import { initialTeamActionResult } from "../actions/team-action-result";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
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

  if (state.status === "success") {
    return (
      <InvitationShell>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Check className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Invitation accepted</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You are now part of {invitation.establishmentName}.
        </p>
      </InvitationShell>
    );
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
          <CardTitle>{invitation.organizationName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 py-4 text-sm">
          <p className="flex items-center gap-3">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{invitation.establishmentName}</span>
          </p>
          <p className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" />
            <span>{invitation.maskedEmail}</span>
          </p>
        </CardContent>
      </Card>

      {state.status === "error" ? (
        <p className="mt-4 text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}

      {authenticated ? (
        <form action={formAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" disabled={pending} className="h-10 w-full">
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                Accepting…
              </>
            ) : (
              "Accept invitation"
            )}
          </Button>
        </form>
      ) : (
        <Link href={signInPath} className={buttonVariants({ className: "mt-6 h-10 w-full" })}>
          Sign in to accept
        </Link>
      )}
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
        This invitation is invalid, expired, or no longer available.
      </p>
    </InvitationShell>
  );
}

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-[440px] rounded-xl border border-border bg-card p-7 text-center shadow-sm">
        {children}
      </section>
    </main>
  );
}
