"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Link2 } from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

type JoinState =
  | { status: "processing" }
  | { status: "success" }
  | { status: "error"; message: string; signInRequired: boolean };

export function JoinShareableLinkView({
  token,
  organizationName,
}: {
  token: string;
  organizationName: string;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<JoinState>({ status: "processing" });

  const join = useEffectEvent(async () => {
    try {
      const response = await fetch("/api/workforce/invitations/shareable-links/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setState({
          status: "error",
          message: readErrorMessage(body),
          signInRequired: response.status === 401,
        });
        return;
      }
      setState({ status: "success" });
      router.replace("/organizations");
      router.refresh();
    } catch (reason) {
      setState({
        status: "error",
        message: reason instanceof Error ? reason.message : "We could not redeem this invitation link.",
        signInRequired: false,
      });
    }
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void join();
  }, []);

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20 px-6 py-7">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            {state.status === "error" ? (
              <CircleAlert className="size-6" aria-hidden="true" />
            ) : (
              <Link2 className="size-6" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">
              {state.status === "error"
                ? "Invitation link unavailable"
                : `Joining ${organizationName}`}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {state.status === "processing"
                ? "We are adding you to the organization. This will take just a moment."
                : null}
              {state.status === "success" ? "All set! Taking you to your workspace." : null}
              {state.status === "error" ? state.message : null}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 py-6">
          {state.status === "processing" || state.status === "success" ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner />
              {state.status === "processing" ? "Processing your invitation..." : "Redirecting..."}
            </div>
          ) : null}

          {state.status === "error" ? (
            <div className="flex flex-wrap gap-3">
              {state.signInRequired ? (
                <Link href="/login" className={buttonVariants()}>
                  Sign in
                </Link>
              ) : null}
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                Go to workspace
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function readErrorMessage(value: unknown): string {
  if (typeof value === "object" && value !== null && "message" in value && typeof value.message === "string") {
    return value.message;
  }
  return "We could not redeem this invitation link. It may have expired or been revoked.";
}
