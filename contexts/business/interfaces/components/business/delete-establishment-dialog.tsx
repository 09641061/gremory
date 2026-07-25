"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteEstablishmentAction } from "../../actions/establishment.actions";
import { initialBusinessActionResult } from "../../actions/business-action-result";
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
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Alert,
  AlertDescription,
} from "@/contexts/shared/interfaces/components/ui/alert";

interface DeleteEstablishmentDialogProps {
  establishmentId: string;
  establishmentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEstablishmentDialog({
  establishmentId,
  establishmentName,
  open,
  onOpenChange,
}: DeleteEstablishmentDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteEstablishmentAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <AlertDialog
      open={open && state.status !== "success"}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete establishment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {establishmentName}
              </span>
              .
            </AlertDialogDescription>
            {state.status === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <input type="hidden" name="id" value={establishmentId} />
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="gap-2"
            >
              {pending ? (
                <Spinner className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
