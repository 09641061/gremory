"use client";

import { ClipboardEvent, KeyboardEvent, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Card,
  CardContent,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import {
  confirmEmailSignInAction,
  type ConfirmEmailSignInActionState,
} from "../actions/confirm-email-sign-in.action";
import {
  resendEmailSignInAction,
  type ResendEmailSignInActionState,
} from "../actions/resend-email-sign-in.action";

const verificationCodeLength = 6;
const initialActionState: ConfirmEmailSignInActionState = {
  status: "idle",
  error: null,
};
const initialResendState: ResendEmailSignInActionState = {
  status: "idle",
  error: null,
};

export function VerifyForm({
  email,
  returnTo,
  initialError,
}: {
  email: string;
  returnTo?: string | null;
  initialError?: string;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(
    Array(verificationCodeLength).fill("")
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [state, formAction, pending] = useActionState(
    confirmEmailSignInAction,
    initialActionState
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendEmailSignInAction,
    initialResendState
  );

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < next.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    event.preventDefault();
    const next = [...digits];
    pasted
      .slice(0, next.length - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    setDigits(next);

    const nextIndex = Math.min(index + pasted.length, next.length - 1);
    requestAnimationFrame(() => inputRefs.current[nextIndex]?.focus());
  }

  return (
    <>
      {initialError || state.status === "error" || resendState.status === "error" ? (
        <Alert variant="destructive" className="fixed top-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md shadow-lg">
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>
            {initialError ??
              (state.status === "error" ? state.error : undefined) ??
              (resendState.status === "error" ? resendState.error : undefined)}
          </AlertDescription>
        </Alert>
      ) : null}
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6 text-foreground">
        <section className="w-full max-w-[416px] text-center">
          <header className="mb-5">
            <h1 className="text-[27px] font-bold leading-tight tracking-[-0.03em]">
              Check your email
            </h1>
            <p className="mt-2 text-[14px] leading-5 text-muted-foreground">
              We sent a secure sign-in link and verification code.
            </p>
          </header>

          <Card className="rounded-lg border-border bg-card p-7 shadow-sm ring-0">
            <CardContent className="p-0">
              <form action={formAction}>
                <input type="hidden" name="email" value={email} readOnly />
                <input type="hidden" name="code" value={digits.join("")} readOnly />
                {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                <p className="text-[14px] leading-5 text-foreground">
                  To continue, click the link sent to
                  <br />
                  <span className="font-medium">{email}</span>
                </p>

                <div className="mt-5 text-left">
                  <Label className="mb-3 text-muted-foreground">
                    Enter the verification code
                  </Label>

                  <div className="grid grid-cols-6 gap-1.5">
                    {Array.from({ length: verificationCodeLength }, (_, index) => (
                      <Input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        value={digits[index]}
                        aria-label={`Verification digit ${index + 1}`}
                        inputMode="numeric"
                        maxLength={1}
                        type="text"
                        onChange={(event) => handleChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={(event) => handlePaste(index, event)}
                        className="h-10 rounded-md border-border bg-card p-0 text-center text-sm text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="mt-4 h-10 w-full rounded-md text-sm font-semibold"
                >
                  {pending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Verifying...
                    </>
                  ) : (
                    "Verify code"
                  )}
                </Button>
              </form>

              <div className="mt-4 flex flex-col items-center">
                <form action={resendAction}>
                  <input type="hidden" name="email" value={email} readOnly />
                  {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
                  <Button
                    type="submit"
                    variant="link"
                    disabled={resendPending}
                    className="h-auto p-0 text-[14px] font-semibold text-accent-foreground hover:bg-transparent hover:text-accent-foreground hover:underline"
                  >
                    {resendPending ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Resending...
                      </>
                    ) : (
                      "Resend email"
                    )}
                  </Button>
                </form>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login")}
                  className="mt-3 h-auto p-0 text-[14px] font-semibold text-muted-foreground hover:bg-transparent hover:text-muted-foreground hover:underline"
                >
                  Use a different email
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
