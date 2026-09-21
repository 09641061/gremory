"use client";

import { useTransition } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

type ErrorScreenProps = {
  title?: string;
  message?: string;
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
  retryLabel,
  retryingLabel,
}: ErrorScreenProps) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const resolvedTitle = title || t.shared.somethingWentWrong;
  const resolvedMessage = message || t.shared.somethingWentWrongMessage;
  const resolvedRetry = retryLabel ?? t.shared.tryAgain;
  const resolvedRetrying = retryingLabel ?? t.shared.retrying;

  return (
    <main className={mainClassName}>
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <ErrorAlert title={resolvedTitle} message={resolvedMessage} />
        <Button
          type="button"
          variant="outline"
          onClick={() => startTransition(() => reset())}
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? <Spinner className="size-4" /> : null}
          {isPending ? resolvedRetrying : resolvedRetry}
        </Button>
      </div>
    </main>
  );
}
