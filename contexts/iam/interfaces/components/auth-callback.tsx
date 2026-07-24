"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && refreshToken) {
      void (async () => {
        try {
          const sessionResponse = await fetch("/api/iam/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken,
              refreshToken,
              expiresIn: expiresIn ? Number(expiresIn) : undefined,
            }),
          });

          if (!sessionResponse.ok) {
            router.replace("/login");
            return;
          }

          const subscriptionResponse = await fetch("/api/billing/subscription/status", {
            cache: "no-store",
          });
          const subscription = subscriptionResponse.ok
            ? ((await subscriptionResponse.json()) as { active?: boolean })
            : { active: false };
          router.replace(subscription.active === true ? "/chat" : "/subscribe");
        } catch {
          router.replace("/subscribe");
        }
      })();
      return;
    }

    router.replace("/");
  }, [router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background text-foreground"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">Signing you in</span>
    </main>
  );
}
