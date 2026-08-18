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

// Fixed UTC offsets keep the selector compact and avoid country-specific labels.
// Existing IANA values are still supported below for establishments already saved.
const TIME_ZONE_OPTIONS = [
  { value: "Etc/GMT+8", label: "UTC−08:00" },
  { value: "Etc/GMT+7", label: "UTC−07:00" },
  { value: "Etc/GMT+6", label: "UTC−06:00" },
  { value: "Etc/GMT+5", label: "UTC−05:00" },
  { value: "Etc/GMT+4", label: "UTC−04:00" },
  { value: "Etc/GMT+3", label: "UTC−03:00" },
  { value: "UTC", label: "UTC+00:00" },
  { value: "Etc/GMT-1", label: "UTC+01:00" },
  { value: "Etc/GMT-2", label: "UTC+02:00" },
  { value: "Etc/GMT-3", label: "UTC+03:00" },
  { value: "Asia/Kolkata", label: "UTC+05:30" },
  { value: "Etc/GMT-8", label: "UTC+08:00" },
  { value: "Etc/GMT-9", label: "UTC+09:00" },
  { value: "Etc/GMT-10", label: "UTC+10:00" },
  { value: "Etc/GMT-12", label: "UTC+12:00" },
] as const;

const LEGACY_TIME_ZONE_LABELS: Record<string, string> = {
  "America/Lima": "UTC−05:00",
  "America/Guayaquil": "UTC−05:00",
  "America/Bogota": "UTC−05:00",
  "America/Mexico_City": "UTC−06:00",
  "America/New_York": "UTC−05:00",
  "America/Los_Angeles": "UTC−08:00",
  "America/Santiago": "UTC−04:00",
  "America/Argentina/Buenos_Aires": "UTC−03:00",
  "America/Sao_Paulo": "UTC−03:00",
  "Europe/Madrid": "UTC+01:00",
  "Europe/London": "UTC+00:00",
  "Europe/Paris": "UTC+01:00",
};

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
    TIME_ZONE_OPTIONS.find((option) => option.value === timeZone)?.label ??
    LEGACY_TIME_ZONE_LABELS[timeZone] ??
    timeZone
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

    return [{ value, label: getTimeZoneLabel(value) }, ...TIME_ZONE_OPTIONS];
  }, [value]);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
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

      <SelectContent className="scrollbar-hide p-1">
        <SelectGroup>
            <SelectLabel className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              UTC time zones
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
    </>
  );
}
