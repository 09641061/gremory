"use client";

import { useEffect, useTransition } from "react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export default function PermissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error("Unexpected permissions error", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <ErrorAlert
          title="Could not load permissions"
          message="We hit a problem while loading the roles list. Please try again."
        />
        <button
          type="button"
          onClick={() => startTransition(() => reset())}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm disabled:opacity-60"
        >
          {isPending ? <Spinner className="size-4" /> : null}
          {isPending ? "Retrying..." : "Try again"}
        </button>
      </div>
    </main>
  );
}
