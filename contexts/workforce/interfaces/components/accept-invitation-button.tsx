"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { acceptWorkforceInvitationAction } from "../actions/workforce.actions";

export function AcceptInvitationButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={pending} onClick={() => startTransition(async () => {
        const result = await acceptWorkforceInvitationAction(token);
        if (result && !result.success) setError(result.error);
      })}>
        {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        {pending ? "Aceptando…" : "Aceptar invitación"}
      </Button>
    </div>
  );
}
