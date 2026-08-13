"use client";

import Link from "next/link";
import { Building2, Check, Mail, Store, Users } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
  const [redirectAttempt, setRedirectAttempt] = useState(0);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const returnTo = `/invitations/accept?${new URLSearchParams({ token })}`;
  const shouldResolveWorkspace = state.status === "success" || invitation.status === "ACCEPTED";

  useEffect(() => {
    if (!shouldResolveWorkspace) {
      return;
    }

    void resolveWorkspaceEntryPath()
      .then((target) => {
        if (!target) {
          setRedirectError(
            "We could not prepare your workspace yet. Please try again in a moment.",
          );
          return;
        }

        window.location.assign(target);
      })
      .catch((error: unknown) => {
        setRedirectError(
          error instanceof Error
            ? error.message
            : "We could not prepare your workspace yet. Please try again.",
        );
      });
  }, [redirectAttempt, shouldResolveWorkspace]);

  if (shouldResolveWorkspace) {
    return (
      <InvitationAcceptedView
        redirectError={redirectError}
        onRetry={() => {
          setRedirectError(null);
          setRedirectAttempt((value) => value + 1);
        }}
        returnTo={returnTo}
      />
    );
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
          <Button type="submit" disabled={pending} className="h-10 w-full">
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
        <Link href={signInPath} className={buttonVariants({ className: "mt-6 h-10 w-full" })}>
          Sign in to accept
        </Link>
      )}
    </InvitationShell>
  );
}

function InvitationAcceptedView({
  redirectError = null,
  onRetry,
  returnTo,
}: {
  redirectError?: string | null;
  onRetry?: () => void;
  returnTo: string;
}) {
  const redirecting = !redirectError;

  return (
    <InvitationShell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Invitation accepted</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {redirecting
          ? "Redirecting you to Takodu..."
          : redirectError
            ? redirectError
            : "You already have access to this workspace."}
      </p>
      {redirecting ? (
        <div className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <Spinner data-icon="inline-start" />
          Preparing your workspace
        </div>
      ) : redirectError ? (
        <div className="mt-6 space-y-3">
          <Button type="button" onClick={onRetry} className="h-10 w-full">
            Try again
          </Button>
          <Link
            href={returnTo}
            className={buttonVariants({ variant: "outline", className: "h-10 w-full" })}
          >
            Back to invitation
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <Button type="button" onClick={onRetry} className="h-10 w-full">
            Prepare workspace
          </Button>
        </div>
      )}
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

async function resolveWorkspaceEntryPath(): Promise<string | null> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch("/api/business/workspace", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      const workspace = (await response.json()) as {
        activeOrganizationId?: string | null;
        activeEstablishmentId?: string | null;
        organizations?: Array<{
          id: string;
          establishments: Array<{ id: string }>;
        }>;
      };

      const organizationId =
        workspace.activeOrganizationId
        ?? workspace.organizations?.[0]?.id
        ?? undefined;
      const establishmentId =
        workspace.activeEstablishmentId
        ?? workspace.organizations?.find((item) => item.id === organizationId)?.establishments[0]?.id
        ?? undefined;

      if (organizationId && establishmentId) {
        const params = new URLSearchParams();
        params.set("organizationId", organizationId);
        params.set("establishmentId", establishmentId);
        return `/?${params.toString()}`;
      }
    }

    if (attempt < maxAttempts) {
      await sleep(500);
    }
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
