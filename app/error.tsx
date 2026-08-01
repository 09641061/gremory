"use client";

import { useEffect, useTransition } from "react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error("Unexpected application error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <ErrorAlert
          title="Something went wrong"
          message="We could not complete this request. Please try again."
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
