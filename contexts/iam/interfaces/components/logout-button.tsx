"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
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
      <ErrorAlert
        title="Unable to log out"
        message={!pending ? error ?? undefined : undefined}
        resetKey={pending ? "pending" : error ?? "idle"}
      />
    </div>
  );
}
