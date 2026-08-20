"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";

interface DeleteRoleDialogProps {
  roleId: string;
  roleName: string;
  /** Number of members currently assigned this role. Blocks deletion while > 0. */
  memberCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoleDialog({ roleId, roleName, memberCount, open, onOpenChange }: DeleteRoleDialogProps) {
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

  const assignedToMembers = memberCount > 0;

  return (
    <DeleteConfirmDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
      entityLabel="role"
      entityName={roleName}
      pending={pending}
      error={state.status === "error" ? state.error : null}
      confirmDisabled={assignedToMembers}
      formAction={formAction}
      description={
        assignedToMembers ? (
          <>
            <span className="font-medium text-foreground">{roleName}</span> is assigned to {memberCount}{" "}
            {memberCount === 1 ? "member" : "members"}. Remove the role from all members before deleting it.
          </>
        ) : undefined
      }
    >
      <input type="hidden" name="roleId" value={roleId} />
    </DeleteConfirmDialog>
  );
}