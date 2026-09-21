"use client";

import * as React from "react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";

interface PhoneInputProps {
  id: string;
  value: string;
  countryCode: string;
  onChange: (value: string) => void;
  onCountryCodeChange: (countryCode: string) => void;
  required?: boolean;
}

export function PhoneInput({
  id,
  value,
  countryCode,
  onChange,
  onCountryCodeChange,
  required = false,
}: PhoneInputProps) {
  const t = useCrmTranslations();
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t.form.phoneLabel}</Label>
      <div className="flex items-center gap-2">
        <Input
          aria-label={t.form.countryCodeLabel}
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value.replace(/[^+\d]/g, ""))}
          placeholder={t.form.countryCodePlaceholder}
          className="w-24"
          required={required}
        />
        <Input
          id={id}
          value={value}
          onChange={handlePhoneChange}
          placeholder={t.form.phonePlaceholder}
          required={required}
        />
      </div>
    </div>
  );
}
