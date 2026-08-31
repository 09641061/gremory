"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
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
      <Dialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <DialogContent>
          <form
            action={formAction}
            onSubmit={() => setSubmitCount((count) => count + 1)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Edit role</DialogTitle>
            </DialogHeader>

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

            <input type="hidden" name="roleId" value={role.id || ""} />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : null}
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
