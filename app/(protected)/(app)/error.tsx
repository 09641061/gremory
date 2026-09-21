"use client";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { useEffect } from "react";
import { ErrorScreen } from "@/contexts/shared/interfaces/components/feedback/error-screen";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    recordSafely("app.protected.app.error", { cause: error });
  }, [error]);

  return (
    <ErrorScreen
      reset={reset}
      mainClassName="flex min-h-0 flex-1 items-center justify-center px-4 text-foreground"
    />
  );
}
