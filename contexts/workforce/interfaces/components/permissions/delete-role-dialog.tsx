"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface DeleteRoleDialogProps {
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoleDialog({ roleId, roleName, isSystemRole, open, onOpenChange }: DeleteRoleDialogProps) {
  const router = useRouter();
  const [errorKey, setErrorKey] = useState(0);
  const [state, formAction, pending] = useActionState(
    deleteWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "error") {
      setErrorKey((prev) => prev + 1);
    }
  }, [state]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  return (
    <>
      <ErrorAlert
        key={errorKey}
        title="Unable to delete role"
        message={state.status === "error" ? state.error : undefined}
      />
      <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form action={formAction}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete role?</AlertDialogTitle>
              <AlertDialogDescription>
                {isSystemRole ? (
                  <>
                    <span className="font-medium text-foreground">{roleName}</span> is the default role,
                    so it cannot be deleted.
                  </>
                ) : (
                  <>
                    This will permanently delete{" "}
                    <span className="font-medium text-foreground">{roleName}</span>.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

          <AlertDialogFooter>
            <input type="hidden" name="roleId" value={roleId} />
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending || isSystemRole} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
              {isSystemRole ? "Protected" : pending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
