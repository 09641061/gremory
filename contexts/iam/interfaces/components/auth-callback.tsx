"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && refreshToken) {
      void fetch("/api/iam/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          expiresIn: expiresIn ? Number(expiresIn) : undefined,
        }),
      }).then(() => router.replace("/"));
      return;
    }

    router.replace("/");
  }, [router]);

  return null;
}
