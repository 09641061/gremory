"use client";

import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { FormField } from "@/contexts/shared/interfaces/components/form/form-field";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
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

            <FormField id="category-name" label={t.dialogs.categoryNameLabel} required>
              <Input
                id="category-name"
                name="name"
                placeholder={t.dialogs.categoryNamePlaceholder}
                required
                className="bg-card border-border"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
                {t.dialogs.cancel}
              </Button>
              <FormSubmitButton isSubmitting={pending} icon={<Save className="size-4" />}>
                {pending ? t.dialogs.saving : t.dialogs.save}
              </FormSubmitButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
