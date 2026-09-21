"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function BackNavigationButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  const { t } = useI18n();

  const handleBack = () => {
    // Configuration pages are opened from a sidebar page (for example Team).
    // Going to the plan home here loses that context and always lands on Chat.
    // Next's client navigation keeps this history entry, even though the
    // document referrer still points to the first page of the session.
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2"
      type="button"
      aria-label={t.common.back}
      title={t.common.back}
      onClick={handleBack}
    >
      <ArrowLeft />
    </Button>
  );
}
