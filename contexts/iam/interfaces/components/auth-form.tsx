import { GoogleIcon } from "./icons/google";

export function AuthForm() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-background px-4 py-6 text-foreground sm:pt-8">
      <section className="w-full max-w-[416px] text-center">
        <header className="mb-5">
          <h1 className="text-[27px] font-bold leading-tight tracking-[-0.03em]">
            Continue to Takodu
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-muted-foreground">
            Sign in or create your account with Google or email.
          </p>
        </header>

        <div className="rounded-[17px] border border-[#d5d5d5] bg-card px-7 py-7 shadow-[0_1px_2px_rgb(0_0_0_/_0.02)] sm:px-[27px]">
          <button
            type="button"
            className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[9px] border border-[#384152] bg-card px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GoogleIcon className="size-[19px]" />
            <span>Continue with Google</span>
          </button>

          <div className="my-5 flex items-center gap-3 text-[12px] font-medium text-foreground">
            <span className="h-px flex-1 bg-[#687080]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#687080]" />
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            className="h-[42px] w-full rounded-[9px] border border-[#384152] bg-card px-3 text-[14px] text-foreground outline-none placeholder:text-foreground/90 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />

          <button
            type="button"
            className="mt-4 h-[42px] w-full rounded-[9px] bg-primary px-4 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Continue with email
          </button>

          <p className="mt-4 text-[11px] leading-4 text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="font-semibold">Terms and Privacy Policy</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
