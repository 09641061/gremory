"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

interface DeleteRoleDialogProps {
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoleDialog({ roleId, roleName, isSystemRole, open, onOpenChange }: DeleteRoleDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  return (
    <DeleteConfirmDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
      entityLabel="role"
      entityName={roleName}
      pending={pending}
      error={state.status === "error" ? state.error : null}
      confirmDisabled={isSystemRole}
      formAction={formAction}
      description={
        isSystemRole ? (
          <>
            <span className="font-medium text-foreground">{roleName}</span> is protected and cannot be deleted.
          </>
        ) : undefined
      }
    >
      <input type="hidden" name="roleId" value={roleId} />
    </DeleteConfirmDialog>
  );
}
