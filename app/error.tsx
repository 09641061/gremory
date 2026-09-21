"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/contexts/shared/interfaces/components/feedback/error-screen";

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
    <ErrorScreen
      reset={reset}
      mainClassName="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
    />
  );
}
