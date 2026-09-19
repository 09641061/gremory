"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { GoogleIcon } from "./icons/google";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Separator } from "@/contexts/shared/interfaces/components/ui/separator";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  requestEmailSignInAction,
  type RequestEmailSignInActionState,
} from "../actions/request-email-sign-in.action";
import { startGoogleAuthAction } from "../actions/start-google-auth.action";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

function GoogleSubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();

  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full gap-2">
      {pending ? <Spinner data-icon="inline-start" /> : <GoogleIcon className="size-4" />}
      {pending ? t.auth.connecting : t.auth.continueWithGoogle}
    </Button>
  );
}

export function AuthForm({
  returnTo = null,
  initialEmail,
  lockEmail = false,
  heading,
  description,
  submitLabel,
  hideGoogle = false,
}: {
  returnTo?: string | null;
  initialEmail?: string;
  lockEmail?: boolean;
  heading?: string;
  description?: string;
  submitLabel?: string;
  hideGoogle?: boolean;
}) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(requestEmailSignInAction, {
    status: "idle",
    error: null,
  } satisfies RequestEmailSignInActionState);

  return (
    <>
      <ErrorAlert
        title={t.auth.errorTitle}
        message={!pending && state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />
      <PageShell className="min-h-svh max-w-none justify-center">
        <section className="mx-auto w-full max-w-[440px]">
          <header className="mb-5 space-y-2 text-center">
            <h1 className="page-title">{heading ?? t.auth.continueToTakodu}</h1>
            <p className="page-description">{description ?? t.auth.authDescription}</p>
          </header>

          <Card>
            <CardContent className="space-y-4 p-6 pt-0">
              {hideGoogle ? null : (
                <>
                  <form action={startGoogleAuthAction}>
                    {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                    <GoogleSubmitButton />
                  </form>

                  <Separator className="my-4" />
                </>
              )}

              <form action={formAction} className="space-y-4 text-left">
                {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.emailAddress}</Label>
                  <Input
                    id="email"
                    name={lockEmail ? undefined : "email"}
                    type="email"
                    placeholder={t.auth.enterEmail}
                    autoComplete="email"
                    defaultValue={initialEmail}
                    disabled={lockEmail}
                    readOnly={lockEmail}
                  />
                  {lockEmail && initialEmail ? (
                    <input type="hidden" name="email" defaultValue={initialEmail} />
                  ) : null}
                  {lockEmail ? (
                    <p className="text-xs leading-4 text-muted-foreground">
                      {t.auth.invitationLockedEmailHint}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" disabled={pending} className="w-full gap-2">
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {pending ? t.auth.sending : submitLabel ?? t.auth.continueWithEmail}
                </Button>
              </form>

              <p className="text-center text-[11px] leading-4 text-muted-foreground">
                {t.auth.termsNotice}
              </p>
            </CardContent>
          </Card>
        </section>
      </PageShell>
    </>
  );
}
