"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";

const IANA_TIME_ZONES = [
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "America/New_York",
  "America/Los_Angeles",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo",
  "Europe/Madrid",
  "Europe/London",
  "Europe/Paris",
  "UTC",
];

export function TimeZoneField({
  name,
  value,
  onChange,
  disabled = false,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="America/Lima"
        list={`${name}-options`}
        disabled={disabled}
        required
      />
      <datalist id={`${name}-options`}>
        {IANA_TIME_ZONES.map((timeZone) => (
          <option key={timeZone} value={timeZone} />
        ))}
      </datalist>
    </div>
  );
}
