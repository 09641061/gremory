import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Card,
  CardContent,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

const verificationSlots = ["1", "2", "3", "4", "5", "6"];

export function VerifyForm() {
  return (
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

        <Card className="rounded-[17px] border border-[#d5d5d5] bg-card px-7 py-7 shadow-[0_1px_2px_rgb(0_0_0_/_0.02)] ring-0 sm:px-[27px]">
          <CardContent className="p-0">
            <p className="text-[14px] leading-5 text-foreground">
              To continue, click the link sent to
              <br />
              <span className="font-medium">email@example.com</span>
            </p>

            <div className="mt-5 text-left">
              <p className="mb-3 text-[14px] text-muted-foreground">
                Enter the verification code
              </p>

              <div className="grid grid-cols-6 gap-1.5">
                {verificationSlots.map((slot) => (
                  <Input
                    key={slot}
                    aria-label={`Verification digit ${slot}`}
                    inputMode="numeric"
                    maxLength={1}
                    type="text"
                    className="h-[42px] rounded-[9px] border-[#384152] bg-card p-0 text-center text-[14px] text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                ))}
              </div>
            </div>

            <Button
              type="button"
              className="mt-4 h-[42px] w-full rounded-[9px] text-[14px] font-semibold"
            >
              Verify code
            </Button>

            <div className="mt-4 flex flex-col items-center">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-[14px] font-semibold text-accent-foreground hover:bg-transparent hover:text-accent-foreground hover:underline"
              >
                Resend email
              </Button>

              <Button
                type="button"
                variant="link"
                className="mt-3 h-auto p-0 text-[14px] font-semibold text-muted-foreground hover:bg-transparent hover:text-muted-foreground hover:underline"
              >
                Use a different email
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
