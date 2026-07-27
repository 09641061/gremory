"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function AuthCallback({ returnTo = null }: { returnTo?: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      void (async () => {
        try {
          const sessionResponse = await fetch("/api/iam/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken,
              refreshToken,
            }),
          });

          if (!sessionResponse.ok) {
            router.replace(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
            return;
          }

          // The proxy is the single route decision point. It validates the
          // new session and sends users without an active subscription to
          // /subscribe.
          router.replace(returnTo ?? "/chat");
        } catch {
          router.replace(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
        }
      })();
      return;
    }

    router.replace("/");
  }, [returnTo, router]);

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
