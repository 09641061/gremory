"use client";

import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { useUpdateServiceCategory } from "../../../application/use-cases/use-update-service-category";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: string; name: string } | null;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
}: EditCategoryModalProps) {
  const { state: updateState, formAction, pending: updatePending } = useUpdateServiceCategory(onClose);

  // Combined error states to display in the modal
  const errorState = updateState.status === "error" ? updateState : null;
  const isActionPending = updatePending;

  return (
    <>
      <ErrorAlert
        title="Failed to process category request"
        message={errorState ? (errorState.error ?? undefined) : undefined}
      />

      <Dialog open={isOpen && !!category} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent>
          <DialogTitle>Edit Category</DialogTitle>

          {category && (
            <form action={formAction} key={category.id} className="space-y-6 mt-4">
              <input type="hidden" name="id" value={category.id} />

              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  name="name"
                  defaultValue={category.name}
                  required
                  className="bg-card border-border"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 mt-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isActionPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isActionPending}
                  className="gap-2"
                >
                  {updatePending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                  {updatePending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
