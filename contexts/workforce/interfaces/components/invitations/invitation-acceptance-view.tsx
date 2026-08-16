"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Building2, Check, Mail, Store, Users } from "lucide-react";

import type { TeamInvitationPreviewView } from "@/contexts/workforce/application/model/team.read-models";
import { acceptTeamInvitationAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import { initialTeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
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
  const [state, formAction, pending] = useActionState(acceptTeamInvitationAction, initialTeamActionResult);

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
      <InvitationShell
        title="Workspace access removed"
        subtitle="Your membership is no longer active. Ask the organization owner to send you a new invitation."
        icon={<Users className="size-6" />}
      />
    );
  }

  if (invitation.status === "ACCEPTED") {
    return <InvitationAcceptedView />;
  }

  const returnTo = `/invitations/accept?${new URLSearchParams({ token })}`;
  const signInPath = `/login?next=${encodeURIComponent(returnTo)}`;

  return (
    <InvitationShell
      title="Join the team"
      subtitle="You have been invited to join this workspace."
      icon={<Users className="size-6" />}
    >
      <Card className="mt-6 text-left">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <Building2 className="size-4 text-muted-foreground" />
            <span>{invitation.organizationName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          <div className="flex items-center gap-3 text-foreground">
            <Store className="size-4 text-muted-foreground" />
            <span>{invitation.establishmentName}</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Invitation ready to accept</span>
          </div>
        </CardContent>
      </Card>

      <ErrorAlert title="Invitation error" message={state.status === "error" ? state.error : undefined} />

      {authenticated ? (
        <form action={formAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" disabled={pending} className="w-full gap-2">
            {pending ? <Spinner className="size-4" /> : null}
            {pending ? "Accepting..." : "Accept invitation"}
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
    <InvitationShell
      title="Invitation accepted"
      subtitle={redirecting ? "Redirecting you to Takodu..." : "You already have access to this workspace."}
      icon={<Check className="size-6" />}
    >
      <Link href="/" className={buttonVariants({ className: "mt-6 w-full" })}>
        Continue to Takodu
      </Link>
    </InvitationShell>
  );
}

export function InvitationExpiredView() {
  return (
    <InvitationShell
      title="Invitation expired"
      subtitle="This invitation has expired and is no longer available."
      icon={<Mail className="size-6" />}
    />
  );
}

export function InvitationUnavailableView() {
  return (
    <InvitationShell
      title="Invitation unavailable"
      subtitle="This invitation is invalid or no longer available."
      icon={<Mail className="size-6" />}
    />
  );
}

function InvitationShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-[440px]">
        <Card>
          <CardContent className="p-7 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
            {children}
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}
