"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

import { useCatalogTranslations } from "../../i18n";

interface GeneralInfoSectionProps {
  defaultValues?: {
    name?: string;
    description?: string;
  };
  disabled?: boolean;
}

export function GeneralInfoSection({ defaultValues, disabled }: GeneralInfoSectionProps) {
  const { t } = useCatalogTranslations();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t.serviceForm.serviceNameLabel}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t.serviceForm.serviceNamePlaceholder}
          defaultValue={defaultValues?.name ?? ""}
          required
          className="bg-card border-border"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t.serviceForm.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder={t.serviceForm.descriptionPlaceholder}
          defaultValue={defaultValues?.description ?? ""}
          required
          className="min-h-[76px] max-h-[200px]"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
