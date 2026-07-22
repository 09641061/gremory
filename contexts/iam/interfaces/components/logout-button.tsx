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
    startTransition(async () => {
      const result = await signOutAction();

      if (result.status === "error") {
        setError(result.error);
        return;
      }

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
