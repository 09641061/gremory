"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { acceptPendingInvitationAction } from "@/contexts/notifications/interfaces/actions/notification.actions";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function AcceptPendingInvitationButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setPending(true);
    setError(null);
    const result = await acceptPendingInvitationAction();
    if (result.success) {
      router.replace("/");
      router.refresh();
      return;
    }
    setError(result.error ?? t.onboarding.invitationUnavailable);
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={handleAccept} disabled={pending} className="w-full gap-2 sm:w-auto">
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
        {pending ? t.onboarding.acceptingInvitation : t.onboarding.acceptInvitation}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
