"use client";

import { useEffect } from "react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unexpected application error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <ErrorAlert
        title="Something went wrong"
        message="We could not complete this request. Please try again."
      />
      <button
        type="button"
        onClick={reset}
        className="fixed right-4 top-28 z-50 rounded-md border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
      >
        Try again
      </button>
    </main>
  );
}
