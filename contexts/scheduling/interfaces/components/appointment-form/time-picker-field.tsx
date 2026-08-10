"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/contexts/shared/interfaces/components/ui/popover";
import { cn } from "@/lib/utils";

const MINUTE_STEP = 15;
const DEFAULT_TIME = "09:00";

interface TimePickerFieldProps {
  id: string;
  /** 24h `HH:MM`. Empty string means "nothing chosen yet". */
  value: string;
  onChange: (value: string) => void;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function to12Hour(hour24: number) {
  return hour24 % 12 === 0 ? 12 : hour24 % 12;
}

export function TimePickerField({ id, value, onChange }: TimePickerFieldProps) {
  const [hour24, minute] = (value || DEFAULT_TIME).split(":").map(Number);
  const isPM = hour24 >= 12;
  const hour12 = to12Hour(hour24);

  // Free-typing buffers. They mirror the prop but tolerate the transient
  // states ("", "1") that a controlled two-digit field must allow.
  const [hourInput, setHourInput] = useState(() => pad(hour12));
  const [minuteInput, setMinuteInput] = useState(() => pad(minute));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setHourInput(pad(hour12));
    setMinuteInput(pad(minute));
  }

  const commit = (nextHour24: number, nextMinute: number) => {
    onChange(`${pad((nextHour24 + 24) % 24)}:${pad((nextMinute + 60) % 60)}`);
  };

  const shiftHour = (delta: number) => commit(hour24 + delta, minute);
  const shiftMinute = (delta: number) => commit(hour24, minute + delta);
  const toggleMeridiem = () => commit(isPM ? hour24 - 12 : hour24 + 12, minute);

  const handleHourInput = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 2);
    setHourInput(cleaned);

    const parsed = Number(cleaned);
    if (!cleaned || parsed < 1 || parsed > 12) return;
    // Typing "1" on the way to "12" must not move the appointment to 1 o'clock,
    // so a lone "1" waits for the second digit or for blur.
    if (cleaned === "1") return;
    commit(isPM ? (parsed % 12) + 12 : parsed % 12, minute);
  };

  const handleHourBlur = () => {
    const parsed = Number(hourInput);
    if (!hourInput || Number.isNaN(parsed) || parsed < 1 || parsed > 12) {
      setHourInput(pad(hour12));
      return;
    }
    commit(isPM ? (parsed % 12) + 12 : parsed % 12, minute);
  };

  const handleMinuteInput = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 2);
    setMinuteInput(cleaned);

    const parsed = Number(cleaned);
    if (cleaned && parsed >= 0 && parsed <= 59) commit(hour24, parsed);
  };

  const handleMinuteBlur = () => {
    const parsed = Number(minuteInput);
    if (!minuteInput || Number.isNaN(parsed) || parsed < 0 || parsed > 59) {
      setMinuteInput(pad(minute));
      return;
    }
    commit(hour24, parsed);
  };

  const spinnerFieldClass =
    "h-10 w-12 rounded-md border border-border bg-background text-center text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between gap-3 px-3 text-left font-normal"
        )}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? `${pad(hour12)}:${pad(minute)} ${isPM ? "PM" : "AM"}` : "Select time..."}
        </span>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto gap-0 p-3">
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => shiftHour(1)}
              aria-label="Increase hour"
            >
              <ChevronUp className="size-4" />
            </Button>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Hour"
              value={hourInput}
              onChange={(event) => handleHourInput(event.target.value)}
              onBlur={handleHourBlur}
              className={spinnerFieldClass}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => shiftHour(-1)}
              aria-label="Decrease hour"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <div aria-hidden className="self-center text-sm text-foreground">
            :
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => shiftMinute(MINUTE_STEP)}
              aria-label={`Increase minutes by ${MINUTE_STEP}`}
            >
              <ChevronUp className="size-4" />
            </Button>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Minutes"
              value={minuteInput}
              onChange={(event) => handleMinuteInput(event.target.value)}
              onBlur={handleMinuteBlur}
              className={spinnerFieldClass}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => shiftMinute(-MINUTE_STEP)}
              aria-label={`Decrease minutes by ${MINUTE_STEP}`}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={toggleMeridiem}
            aria-label={`Switch to ${isPM ? "AM" : "PM"}`}
            className="ml-1.5 h-10 w-12 self-center"
          >
            {isPM ? "PM" : "AM"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
