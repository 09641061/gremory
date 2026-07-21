import { GoogleIcon } from "./icons/google";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { requestEmailSignInAction } from "../actions/request-email-sign-in.action";
import { startGoogleAuthAction } from "../actions/start-google-auth.action";

export function AuthForm() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6 text-foreground">
      <section className="w-full max-w-[416px] text-center">
        <header className="mb-5">
          <h1 className="text-[27px] font-bold leading-tight tracking-[-0.03em]">
            Continue to Takodu
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-muted-foreground">
            Sign in or create your account with Google or email.
          </p>
        </header>

        <Card className="rounded-[17px] border border-[#d5d5d5] bg-card px-7 py-7 shadow-[0_1px_2px_rgb(0_0_0_/_0.02)] ring-0 sm:px-[27px]">
          <CardContent className="p-0">
          <form action={startGoogleAuthAction}>
            <Button
              type="submit"
              variant="outline"
              className="h-[42px] w-full rounded-[9px] border-[#384152] bg-card px-4 text-[14px] font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <GoogleIcon className="size-[19px]" />
              <span>Continue with Google</span>
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[12px] font-medium text-foreground">
            <span className="h-px flex-1 bg-[#687080]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#687080]" />
          </div>

          <form action={requestEmailSignInAction}>
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="h-[42px] rounded-[9px] border-[#384152] bg-card px-3 text-[14px] text-foreground placeholder:text-foreground/90 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />

            <Button
              type="submit"
              className="mt-4 h-[42px] w-full rounded-[9px] bg-primary px-4 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Continue with email
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
  );
}
