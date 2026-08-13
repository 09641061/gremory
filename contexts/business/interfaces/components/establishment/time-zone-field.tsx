"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/contexts/shared/interfaces/components/ui/native-select";

const TIME_ZONE_OPTIONS = [
  { value: "America/Lima", label: "Lima, Peru" },
  { value: "America/Guayaquil", label: "Quito, Ecuador" },
  { value: "America/Bogota", label: "Bogota, Colombia" },
  { value: "America/Mexico_City", label: "Mexico City, Mexico" },
  { value: "America/New_York", label: "New York, USA" },
  { value: "America/Los_Angeles", label: "Los Angeles, USA" },
  { value: "America/Santiago", label: "Santiago, Chile" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires, Argentina" },
  { value: "America/Sao_Paulo", label: "Sao Paulo, Brazil" },
  { value: "Europe/Madrid", label: "Madrid, Spain" },
  { value: "Europe/London", label: "London, UK" },
  { value: "Europe/Paris", label: "Paris, France" },
  { value: "UTC", label: "UTC" },
];

function formatTimeInZone(timeZone: string, timestamp: number) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  } catch {
    return "Invalid zone";
  }
}

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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const selectOptions = useMemo(() => {
    if (!value) {
      return TIME_ZONE_OPTIONS;
    }

    if (TIME_ZONE_OPTIONS.some((option) => option.value === value)) {
      return TIME_ZONE_OPTIONS;
    }

    return [{ value, label: value }, ...TIME_ZONE_OPTIONS];
  }, [value]);

  return (
    <NativeSelect
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      required
      className="w-full"
    >
      <NativeSelectOption value="" disabled>
        Select a time zone
      </NativeSelectOption>
      {selectOptions.map((timeZone) => (
        <NativeSelectOption key={timeZone.value} value={timeZone.value}>
          {timeZone.label} - {formatTimeInZone(timeZone.value, now)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
