"use client";

import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { useCreateServiceCategory } from "../../hooks/use-create-service-category";
import { useCatalogTranslations } from "../../i18n";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId?: string;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  establishmentId,
}: CreateCategoryModalProps) {
  const { t } = useCatalogTranslations();
  const { state, formAction, pending } = useCreateServiceCategory(onClose);

  return (
    <>
      <ErrorAlert
        title={t.dialogs.failedToCreateCategory}
        message={state.status === "error" && !pending ? (state.error ?? undefined) : undefined}
      />

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent>
          <DialogTitle>{t.dialogs.newCategoryTitle}</DialogTitle>

          <form action={formAction} className="space-y-6 mt-4">
            <input type="hidden" name="establishmentId" value={establishmentId ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="category-name">{t.dialogs.categoryNameLabel}</Label>
              <Input
                id="category-name"
                name="name"
                placeholder={t.dialogs.categoryNamePlaceholder}
                required
                className="bg-card border-border"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
                {t.dialogs.cancel}
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="gap-2"
              >
                {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                {pending ? t.dialogs.saving : t.dialogs.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
