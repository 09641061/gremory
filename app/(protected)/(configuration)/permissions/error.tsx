"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/contexts/shared/interfaces/components/error-screen";

export default function PermissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unexpected permissions error", error);
  }, [error]);

  return (
    <ErrorScreen
      title="Could not load permissions"
      message="We hit a problem while loading the roles list. Please try again."
      reset={reset}
      mainClassName="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-4 text-foreground"
    />
  );
}
