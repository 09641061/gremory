"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/dialogs/delete-confirm-dialog";
import { deactivateWorkforceMemberAction } from "../actions/workforce.actions";

type MemberRowActionsProps = {
  organizationId: string;
  membershipId: string;
  email: string;
};

export function MemberRowActions({ organizationId, membershipId, email }: MemberRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deactivate = () => startTransition(async () => {
    setError(null);
    const result = await deactivateWorkforceMemberAction(organizationId, membershipId);
    if (result.success) {
      setOpen(false);
      return;
    }
    setError(result.error);
  });

  const updateOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setError(null);
  };

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Trash2 />
        Dar de baja
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={updateOpen}
        entityLabel="colaborador"
        entityName={email}
        pending={pending}
        error={error}
        confirmLabel="Dar de baja"
        pendingLabel="Dando de baja..."
        description={(
          <>
            <span className="font-medium text-foreground">{email}</span> perderá el acceso a la organización.
            Si tiene citas futuras, primero tendrás que reasignarlas.
          </>
        )}
        onConfirm={deactivate}
      />
    </>
  );
}
