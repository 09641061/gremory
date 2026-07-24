"use client";

import { XIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { useUpdateServiceCategory } from "../../application/use-cases/use-update-service-category";

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
  const { state, formAction, pending } = useUpdateServiceCategory(onClose);

  if (!isOpen || !category) return null;

  return (
    <>
      <ErrorAlert
        title="Failed to update category"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <header className="flex justify-between items-center px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-[#00b77a]">Edit Category</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <XIcon className="size-4" />
            </Button>
          </header>

          <form action={formAction} className="p-6 space-y-4">
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

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="bg-[#00b77a] hover:bg-[#00b77a]/90 text-white font-medium"
              >
                {pending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
