"use client";

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
    console.error("Unexpected protected application error", error);
  }, [error]);

  return (
    <ErrorScreen
      reset={reset}
      mainClassName="flex min-h-0 flex-1 items-center justify-center px-4 text-foreground"
    />
  );
}
