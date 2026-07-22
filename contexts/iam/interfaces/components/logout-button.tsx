"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { signOutAction } from "../actions/sign-out.action";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    const accessToken = window.localStorage.getItem("takodu.access_token");
    const refreshToken = window.localStorage.getItem("takodu.refresh_token");

    if (!accessToken || !refreshToken) {
      window.localStorage.clear();
      router.replace("/login");
      return;
    }

    startTransition(async () => {
      const result = await signOutAction(accessToken, refreshToken);

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      window.localStorage.removeItem("takodu.access_token");
      window.localStorage.removeItem("takodu.refresh_token");
      window.localStorage.removeItem("takodu.expires_in");
      router.replace("/login");
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" variant="outline" onClick={handleLogout} disabled={pending}>
        {pending ? "Signing out..." : "Log out"}
      </Button>
      {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
    </div>
  );
}
