"use client";

import { XIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { useUpdateServiceCategory } from "../../application/use-cases/use-update-service-category";

import { useDeleteServiceCategory } from "../../application/use-cases/use-delete-service-category";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: string; name: string } | null;
  servicesCount: number;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
  servicesCount,
}: EditCategoryModalProps) {
  const { state: updateState, formAction, pending: updatePending } = useUpdateServiceCategory(onClose);
  const { deleteCategory, pending: deletePending, state: deleteState } = useDeleteServiceCategory(onClose);

  if (!isOpen || !category) return null;

  // Combined error states to display in the modal
  const errorState = updateState.status === "error" ? updateState : deleteState.status === "error" ? deleteState : null;
  const isActionPending = updatePending || deletePending;

  return (
    <>
      <ErrorAlert
        title="Failed to process category request"
        message={errorState ? (errorState.error ?? undefined) : undefined}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <header className="flex justify-between items-center px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-primary">Edit Category</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <XIcon className="size-4" />
            </Button>
          </header>

          <form action={formAction} key={category.id} className="p-6 space-y-4">
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



            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
              {/* Show delete button only if there are no associated services */}
              {servicesCount === 0 ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isActionPending}
                  onClick={() => deleteCategory(category.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
                >
                  {deletePending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Category"
                  )}
                </Button>
              ) : (
                <div /> // Placeholder to align submit buttons to the right
              )}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isActionPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {updatePending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
