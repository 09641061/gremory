"use client";

import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function PageLoading() {
  const { t } = useI18n();
  return (
    <div
      className="flex min-h-[60svh] w-full flex-1 items-center justify-center"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );
}
