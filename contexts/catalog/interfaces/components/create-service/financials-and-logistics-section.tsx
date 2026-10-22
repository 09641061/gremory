"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { useCatalogTranslations } from "../../i18n";

interface FinancialsAndLogisticsSectionProps {
  currency?: "USD" | "PEN";
  defaultValues?: {
    price?: number;
    durationMinutes?: number;
    preparationMinutes?: number;
    cleanupMinutes?: number;
  };
  disabled?: boolean;
}

function numberFieldValue(value?: number) {
  return value ? String(value) : "";
}

export function FinancialsAndLogisticsSection({
  currency = "USD",
  defaultValues,
  disabled,
}: FinancialsAndLogisticsSectionProps) {
  const { t } = useCatalogTranslations();
  const currencySymbol = currency === "PEN" ? "S/" : "$";
  const priceLabel = t.serviceForm.priceLabel.replace("{currency}", currencySymbol);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Financials */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">{priceLabel}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              {currencySymbol}
            </span>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={numberFieldValue(defaultValues?.price)}
              required
              className="pl-11 bg-card border-border"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes" className="text-xs">
              {t.serviceForm.durationLabel}
            </Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              max={1440}
              placeholder={t.serviceForm.durationPlaceholder}
              defaultValue={numberFieldValue(defaultValues?.durationMinutes ?? 30)}
              required
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preparationMinutes" className="text-xs">
              {t.serviceForm.prepLabel}
            </Label>
            <Input
              id="preparationMinutes"
              name="preparationMinutes"
              type="number"
              min={0}
              max={1440}
              placeholder={t.serviceForm.prepPlaceholder}
              defaultValue={numberFieldValue(defaultValues?.preparationMinutes)}
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cleanupMinutes" className="text-xs">
              {t.serviceForm.cleanLabel}
            </Label>
            <Input
              id="cleanupMinutes"
              name="cleanupMinutes"
              type="number"
              min={0}
              max={1440}
              placeholder={t.serviceForm.cleanPlaceholder}
              defaultValue={numberFieldValue(defaultValues?.cleanupMinutes)}
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
