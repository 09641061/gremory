"use client";

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

type AssistantConversationDeleteDialogProps = {
  open: boolean;
  title: string;
  error: string | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AssistantConversationDeleteDialog({
  open,
  title,
  error,
  isSaving,
  onOpenChange,
  onConfirm,
}: AssistantConversationDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
            <span className="mt-1 block font-medium text-foreground">{title}</span>
          </AlertDialogDescription>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isSaving}
            onClick={onConfirm}
          >
            {isSaving ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
