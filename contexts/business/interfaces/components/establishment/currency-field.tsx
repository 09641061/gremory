"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { useBusinessTranslations } from "../../i18n";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "Dólares ($ - USD)", enLabel: "US Dollars ($ - USD)" },
  { value: "PEN", label: "Soles (S/ - PEN)", enLabel: "Peruvian Soles (S/ - PEN)" },
] as const;

export function CurrencyField({
  name = "currency",
  value = "USD",
  onChange,
  disabled = false,
}: {
  name?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { locale } = useBusinessTranslations();
  const effectiveValue = value === "PEN" ? "PEN" : "USD";

  const items = CURRENCY_OPTIONS.map((c) => ({
    value: c.value,
    label: locale === "es" ? c.label : c.enLabel,
  }));

  return (
    <>
      <input type="hidden" name={name} value={effectiveValue} />
      <Select
        items={items}
        value={effectiveValue}
        onValueChange={(next) => onChange(typeof next === "string" ? next : "USD")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {(selectedValue: string | null) =>
              items.find((i) => i.value === selectedValue)?.label ?? "USD"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="p-1">
          <SelectGroup>
            {items.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
