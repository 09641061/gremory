"use client";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
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
    recordSafely("app.error", { cause: error });
  }, [error]);

  return (
    <ErrorScreen
      reset={reset}
      mainClassName="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
    />
  );
}
