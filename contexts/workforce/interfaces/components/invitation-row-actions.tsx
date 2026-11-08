"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { resendWorkforceInvitationAction, revokeWorkforceInvitationAction } from "../actions/workforce.actions";

export function InvitationRowActions({ organizationId, invitationId }: { organizationId: string; invitationId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const resend = () => startTransition(async () => {
    const result = await resendWorkforceInvitationAction(organizationId, invitationId);
    setMessage(result.success ? "Invitación reenviada." : result.error);
  });
  const revoke = () => startTransition(async () => {
    const result = await revokeWorkforceInvitationAction(organizationId, invitationId);
    setMessage(result.success ? null : result.error);
  });

  return (
    <div className="flex items-center justify-end gap-1">
      {message ? <span className="sr-only" role="status">{message}</span> : null}
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={resend}><RefreshCw />Reenviar</Button>
      <AlertDialog>
        <AlertDialogTrigger render={<Button type="button" variant="ghost" size="sm" disabled={pending} />}><Trash2 />Revocar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Revocar esta invitación?</AlertDialogTitle><AlertDialogDescription>El enlace dejará de funcionar inmediatamente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={revoke}>Revocar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
