"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/contexts/shared/interfaces/components/error-screen";

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
      title="Something went wrong"
      message="We could not complete this request. Please try again."
      reset={reset}
      mainClassName="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 text-foreground"
    />
  );
}
