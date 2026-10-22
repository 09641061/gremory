"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { GoogleIcon } from "./icons/google";
import { AuthBrandPanel } from "./auth-brand-panel";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { AuthSplitLayout } from "@/contexts/shared/interfaces/components/layout/auth-split-layout";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  requestEmailSignInAction,
  type RequestEmailSignInActionState,
} from "../actions/request-email-sign-in.action";
import { startGoogleAuthAction } from "../actions/start-google-auth.action";
import { useIamI18n } from "../i18n";

function GoogleSubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useIamI18n();

  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full gap-2">
      {pending ? <Spinner data-icon="inline-start" /> : <GoogleIcon className="size-4" />}
      {pending ? t.auth.connecting : t.auth.continueWithGoogle}
    </Button>
  );
}

export function AuthForm({ returnTo = null }: { returnTo?: string | null }) {
  const { t } = useIamI18n();
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

      <AuthSplitLayout aside={<AuthBrandPanel brand={t.auth.brand} />}>
        <div className="w-full max-w-[400px] space-y-6">
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<Link href="/" />}
            className="h-9 w-fit gap-2 px-2.5 font-bold tracking-tight text-foreground hover:bg-transparent lg:hidden"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            {t.auth.brand.name}
            <span className="sr-only">· {t.auth.brand.backToHome}</span>
          </Button>

          <header className="space-y-2">
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
              {t.auth.continueToTakodu}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.auth.authDescription}
            </p>
          </header>

          <form action={startGoogleAuthAction}>
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <GoogleSubmitButton />
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t.auth.orWithEmail}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={formAction} className="space-y-4">
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.emailAddress}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t.auth.enterEmail}
                autoComplete="email"
              />
            </div>

            <Button type="submit" disabled={pending} className="w-full gap-2">
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {pending ? t.auth.sending : t.auth.continueWithEmail}
            </Button>
          </form>

          <p className="text-center text-[11px] leading-4 text-muted-foreground">
            {t.auth.termsNotice}
          </p>
        </div>
      </AuthSplitLayout>
    </>
  );
}
