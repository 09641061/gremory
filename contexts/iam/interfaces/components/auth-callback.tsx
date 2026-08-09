"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { createSessionAction } from "@/contexts/iam/interfaces/actions/create-session.action";

export function AuthCallback({ returnTo = null }: { returnTo?: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      void (async () => {
        try {
          await createSessionAction({ accessToken, refreshToken });
          // Let the proxy resolve the best landing page for the new session.
          router.replace(returnTo ?? "/");
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
