"use client";

import { useTransition } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

type ErrorScreenProps = {
  title: string;
  message: string;
  reset: () => void;
  mainClassName: string;
  retryLabel?: string;
  retryingLabel?: string;
};

export function ErrorScreen({
  title,
  message,
  reset,
  mainClassName,
  retryLabel = "Try again",
  retryingLabel = "Retrying...",
}: ErrorScreenProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <main className={mainClassName}>
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <ErrorAlert title={title} message={message} />
        <Button
          type="button"
          variant="outline"
          onClick={() => startTransition(() => reset())}
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? <Spinner className="size-4" /> : null}
          {isPending ? retryingLabel : retryLabel}
        </Button>
      </div>
    </main>
  );
}
