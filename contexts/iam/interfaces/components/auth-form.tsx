"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { GoogleIcon } from "./icons/google";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Separator } from "@/contexts/shared/interfaces/components/ui/separator";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  requestEmailSignInAction,
  type RequestEmailSignInActionState,
} from "../actions/request-email-sign-in.action";
import { startGoogleAuthAction } from "../actions/start-google-auth.action";

function GoogleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full gap-2">
      {pending ? <Spinner data-icon="inline-start" /> : <GoogleIcon className="size-4" />}
      {pending ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}

export function AuthForm({ returnTo = null }: { returnTo?: string | null }) {
  const [state, formAction, pending] = useActionState(requestEmailSignInAction, {
    status: "idle",
    error: null,
  } satisfies RequestEmailSignInActionState);

  return (
    <>
      <ErrorAlert
        title="Unable to continue"
        message={!pending && state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />
      <PageShell className="min-h-svh max-w-none justify-center">
        <section className="mx-auto w-full max-w-[440px]">
          <header className="mb-5 space-y-2 text-center">
            <h1 className="page-title">Continue to Takodu</h1>
            <p className="page-description">Sign in or create your account with Google or email.</p>
          </header>

          <Card>
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-base">Access your workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <form action={startGoogleAuthAction}>
                {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                <GoogleSubmitButton />
              </form>

              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <Separator />
                <span className="shrink-0">OR</span>
                <Separator />
              </div>

              <form action={formAction} className="space-y-4 text-left">
                {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" disabled={pending} className="w-full gap-2">
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {pending ? "Sending..." : "Continue with email"}
                </Button>
              </form>

              <p className="text-center text-[11px] leading-4 text-muted-foreground">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </section>
      </PageShell>
    </>
  );
}
