"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/contexts/shared/interfaces/components/ui/alert";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
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
        {pending ? (
          <>
            <Spinner data-icon="inline-start" />
            Signing out...
          </>
        ) : (
          "Log out"
        )}
      </Button>
      {error ? (
        <Alert variant="destructive" className="w-full max-w-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
