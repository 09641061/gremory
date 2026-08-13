"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { cn } from "@/lib/utils";

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
] as const;

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

function getTimeZoneLabel(timeZone: string) {
  return (
    TIME_ZONE_OPTIONS.find((option) => option.value === timeZone)?.label ?? timeZone
  );
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

  const items = useMemo(() => {
    if (!value) {
      return TIME_ZONE_OPTIONS;
    }

    if (TIME_ZONE_OPTIONS.some((option) => option.value === value)) {
      return TIME_ZONE_OPTIONS;
    }

    return [{ value, label: value }, ...TIME_ZONE_OPTIONS];
  }, [value]);

  return (
    <Select
      name={name}
      items={items}
      value={value || null}
      onValueChange={(next) => onChange(typeof next === "string" ? next : "")}
      disabled={disabled}
      required
      >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a time zone">
          {(selectedValue: string | null) =>
            selectedValue ? (
              <span className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {getTimeZoneLabel(selectedValue)}
                </span>
                <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
                  {formatTimeInZone(selectedValue, now)}
                </span>
              </span>
            ) : (
              "Select a time zone"
            )
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="p-1">
        <SelectGroup>
          <SelectLabel className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Common zones
          </SelectLabel>
          {items.map((timeZone) => (
            <SelectItem
              key={timeZone.value}
              value={timeZone.value}
              label={timeZone.label}
              showIndicator={false}
              className="rounded-lg px-2 py-2.5 data-selected:bg-emerald-50 data-selected:text-emerald-950 data-highlighted:bg-emerald-50 data-highlighted:text-emerald-950"
            >
              <span className="flex min-w-0 w-full items-center justify-between gap-4">
                <span className="min-w-0 truncate text-sm font-medium text-foreground">
                  {timeZone.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums",
                    timeZone.value === value ? "text-emerald-700" : "text-foreground"
                  )}
                >
                  {formatTimeInZone(timeZone.value, now)}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
