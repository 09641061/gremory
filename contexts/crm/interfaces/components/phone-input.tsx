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
  { code: "+51", name: "Peru" },
  { code: "+1", name: "USA/Canada" },
  { code: "+34", name: "Spain" },
  { code: "+52", name: "Mexico" },
  { code: "+54", name: "Argentina" },
  { code: "+56", name: "Chile" },
  { code: "+57", name: "Colombia" },
  { code: "+", name: "Other" },
];

export function PhoneInput({
  id,
  value,
  prefix,
  onChange,
  onPrefixChange,
  required = false,
}: PhoneInputProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strict digit validation for Peru
    if (prefix === "+51" && val !== "" && !/^\d+$/.test(val)) return;
    onChange(val);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Phone Number</Label>
      <div className="flex items-center gap-2">
        <select
          value={prefix}
          onChange={(e) => onPrefixChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.name !== "Other" ? `(${c.name})` : ""}
            </option>
          ))}
        </select>
        <Input
          id={id}
          value={value}
          onChange={handlePhoneChange}
          placeholder={prefix === "+51" ? "987654321" : "Phone number"}
          required={required}
          className="flex-1"
        />
      </div>
    </div>
  );
}
