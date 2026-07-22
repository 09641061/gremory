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
      window.localStorage.setItem("takodu.access_token", accessToken);
      window.localStorage.setItem("takodu.refresh_token", refreshToken);
      if (expiresIn) window.localStorage.setItem("takodu.expires_in", expiresIn);
      document.cookie = `takodu.access_token=${encodeURIComponent(accessToken)}; Max-Age=86400; Path=/; SameSite=Lax`;
    }

    router.replace("/");
  }, [router]);

  return null;
}
