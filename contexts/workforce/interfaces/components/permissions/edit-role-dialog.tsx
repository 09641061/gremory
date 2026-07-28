"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface EditRoleDialogProps {
  role: WorkforceRoleSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({ role, open, onOpenChange }: EditRoleDialogProps) {
  const router = useRouter();
  const [submitCount, setSubmitCount] = useState(0);
  const [state, formAction, pending] = useActionState(
    patchWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  return (
    <>
      <ErrorAlert
        key={state.status === "error" ? `${submitCount}-${state.error}` : `idle-${submitCount}`}
        title="Unable to update role"
        message={state.status === "error" ? state.error : undefined}
      />
      <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form
            action={formAction}
            onSubmit={() => setSubmitCount((count) => count + 1)}
            className="space-y-4"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Edit role</AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-2">
              <label htmlFor="edit-role-name" className="text-sm font-medium text-foreground">
                Role Name
              </label>
              <Input
                id="edit-role-name"
                name="name"
                defaultValue={role.name}
                placeholder="Role Name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-role-position" className="text-sm font-medium text-foreground">
                Hierarchy position
              </label>
              <Input
                id="edit-role-position"
                name="position"
                type="number"
                min={1}
                defaultValue={role.position}
                required
              />
              <p className="text-xs text-muted-foreground">
                1 is the highest position. Other roles shift automatically.
              </p>
            </div>

            <input type="hidden" name="roleId" value={role.id || ""} />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : null}
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

