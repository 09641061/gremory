"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { GoogleIcon } from "./icons/google";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  requestEmailSignInAction,
  type RequestEmailSignInActionState,
} from "../actions/request-email-sign-in.action";
import { startGoogleAuthAction } from "../actions/start-google-auth.action";

function GoogleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="w-full gap-2"
    >
      {pending ? (
        <>
          <Spinner data-icon="inline-start" />
          Connecting...
        </>
      ) : (
        <>
          <GoogleIcon className="size-4" />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
}

export function AuthForm({ returnTo = null }: { returnTo?: string | null }) {
  const [state, formAction, pending] = useActionState(
    requestEmailSignInAction,
    { status: "idle", error: null } satisfies RequestEmailSignInActionState
  );

  return (
    <>
      <ErrorAlert
        title="Unable to continue"
        message={!pending && state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6 text-foreground">
        <section className="w-full max-w-[416px] text-center">
        <header className="mb-5">
          <h1 className="page-title">
            Continue to Takodu
          </h1>
          <p className="page-description mt-2">
            Sign in or create your account with Google or email.
          </p>
        </header>

          <Card className="rounded-lg border-border bg-card p-7 shadow-sm ring-0">
          <CardContent className="p-0">
          <form action={startGoogleAuthAction}>
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <GoogleSubmitButton />
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-medium text-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={formAction}>
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="mt-4 w-full"
            >
              {pending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Sending...
                </>
              ) : (
                "Continue with email"
              )}
            </Button>
          </form>

          <p className="mt-4 text-[11px] leading-4 text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="font-semibold">Terms and Privacy Policy</span>.
          </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
