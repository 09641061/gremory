"use client";

import * as React from "react";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface PhoneInputProps {
  id: string;
  value: string;
  prefix: string;
  onChange: (value: string) => void;
  onPrefixChange: (prefix: string) => void;
  required?: boolean;
}

const COUNTRY_CODES = [
  { code: "+51", name: "Peru", length: 9 },
  { code: "+1", name: "USA/Canada", length: 10 },
  { code: "+34", name: "Spain", length: 9 },
  { code: "+52", name: "Mexico", length: 10 },
  { code: "+54", name: "Argentina", length: 10 },
  { code: "+56", name: "Chile", length: 9 },
  { code: "+57", name: "Colombia", length: 10 },
  { code: "+", name: "Other", length: null },
];

export function PhoneInput({
  id,
  value,
  prefix,
  onChange,
  onPrefixChange,
  required = false,
}: PhoneInputProps) {
  const country = COUNTRY_CODES.find((c) => c.code === prefix);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Allow only digits

    if (country?.length) {
      val = val.slice(0, country.length);
    }

    onChange(val);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Phone Number</Label>
      <div className="flex items-center gap-2">
        <select
          value={prefix}
          onChange={(e) => {
            onPrefixChange(e.target.value);
            onChange(""); // Reset number on prefix change to ensure validation
          }}
          className="h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.name !== "Other" ? `(${c.name})` : ""}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Input
            id={id}
            value={value}
            onChange={handlePhoneChange}
            placeholder={country?.length ? `Ex: ${"9".repeat(country.length)}` : "Phone number"}
            required={required}
            className="pr-12"
          />
          {country?.length && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground tabular-nums">
              {value.length}/{country.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
