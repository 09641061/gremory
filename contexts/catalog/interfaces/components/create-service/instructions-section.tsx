"use client";

import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

import { useCatalogTranslations } from "../../i18n";

interface InstructionsSectionProps {
  defaultValues?: {
    preServiceInstructions?: string | null;
    postServiceRecommendations?: string | null;
  };
  disabled?: boolean;
}

export function InstructionsSection({ defaultValues, disabled }: InstructionsSectionProps) {
  const { t } = useCatalogTranslations();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preServiceInstructions">{t.serviceForm.preServiceLabel}</Label>
          <Textarea
            id="preServiceInstructions"
            name="preServiceInstructions"
            rows={2}
            placeholder={t.serviceForm.preServicePlaceholder}
            defaultValue={defaultValues?.preServiceInstructions ?? ""}
            className="min-h-[60px] max-h-[200px]"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postServiceRecommendations">{t.serviceForm.postServiceLabel}</Label>
          <Textarea
            id="postServiceRecommendations"
            name="postServiceRecommendations"
            rows={2}
            placeholder={t.serviceForm.postServicePlaceholder}
            defaultValue={defaultValues?.postServiceRecommendations ?? ""}
            className="min-h-[60px] max-h-[200px]"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
