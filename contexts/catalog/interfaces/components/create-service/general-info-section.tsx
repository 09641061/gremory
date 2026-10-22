"use client";

import { useState } from "react";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import type { CategoryDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { useCatalogTranslations } from "../../i18n";

interface GeneralInfoSectionProps {
  categories?: CategoryDTO[];
  defaultValues?: {
    name?: string;
    description?: string | null;
    categoryId?: string | null;
  };
  disabled?: boolean;
}

export function GeneralInfoSection({
  categories = [],
  defaultValues,
  disabled,
}: GeneralInfoSectionProps) {
  const { t } = useCatalogTranslations();
  const [selectedCatId, setSelectedCatId] = useState<string>(
    defaultValues?.categoryId ?? categories[0]?.id ?? ""
  );

  const [prevDefaultCatId, setPrevDefaultCatId] = useState(defaultValues?.categoryId);
  if (defaultValues?.categoryId !== prevDefaultCatId) {
    setPrevDefaultCatId(defaultValues?.categoryId);
    setSelectedCatId(defaultValues?.categoryId ?? categories[0]?.id ?? "");
  }

  const categoryItems = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="space-y-4">
      {/* Service Name */}
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

      {/* Category Dropdown (Select) */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">{t.serviceForm.categoryLabel}</Label>
        <input type="hidden" name="categoryId" value={selectedCatId} />
        <Select
          items={categoryItems}
          value={selectedCatId}
          onValueChange={(val) => {
            if (typeof val === "string") setSelectedCatId(val);
          }}
          disabled={disabled || categories.length === 0}
        >
          <SelectTrigger className="w-full bg-card border-border">
            <SelectValue placeholder={t.serviceForm.selectCategory}>
              {(selectedVal: string | null) =>
                categoryItems.find((i) => i.value === selectedVal)?.label ??
                t.serviceForm.selectCategory
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="p-1">
            <SelectGroup>
              {categoryItems.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Description (Optional) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">{t.serviceForm.descriptionLabel}</Label>
          <span className="text-xs text-muted-foreground">{t.serviceForm.optional}</span>
        </div>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder={t.serviceForm.descriptionPlaceholder}
          defaultValue={defaultValues?.description ?? ""}
          className="min-h-[76px] max-h-[200px]"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
