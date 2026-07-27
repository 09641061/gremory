"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false);
      router.refresh();
    }
  }, [onOpenChange, router, state.status]);

  return (
    <>
      <ErrorAlert
        title="Unable to create role"
        message={state.status === "error" ? state.error : undefined}
      />
      <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form action={formAction} className="space-y-5">
            <AlertDialogHeader>
              <AlertDialogTitle>Create role</AlertDialogTitle>
              <AlertDialogDescription>
                Create a role. Its permissions will start disabled and can be configured next.
              </AlertDialogDescription>
            </AlertDialogHeader>

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

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {pending ? "Creating..." : "Create role"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
