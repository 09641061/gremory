"use client";

import { useActionState, useEffect } from "react";
import { Plus } from "lucide-react";
import { createWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (role: { roleId?: string; name?: string; position?: number }) => void;
}

export function CreateRoleDialog({ open, onOpenChange, onCreated }: CreateRoleDialogProps) {
  const [state, formAction, pending] = useActionState(
    createWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      if (state.data) onCreated?.(state.data);
      onOpenChange(false);
    }
  }, [onCreated, onOpenChange, state.data, state.status]);

  return (
    <>
      <ErrorAlert
        title="Unable to create role"
        message={state.status === "error" ? state.error : undefined}
      />
      <Dialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <DialogContent>
          <form action={formAction} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Create role</DialogTitle>
              <DialogDescription>
                Create a role. Its permissions will start disabled and can be configured next.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="create-role-name" className="text-sm font-medium text-foreground">
                Role name
              </label>
              <Input
                id="create-role-name"
                name="name"
                placeholder="e.g. Receptionist"
                autoFocus
                required
                maxLength={100}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {pending ? "Creating..." : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
