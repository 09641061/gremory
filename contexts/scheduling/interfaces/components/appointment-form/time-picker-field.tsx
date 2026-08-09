"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "@/contexts/business/interfaces/components/use-selector-menu";
import { useAdaptivePopup } from "./use-adaptive-popup";
import { cn } from "@/lib/utils";

interface TimePickerFieldProps {
  id: string;
  value: string; // "HH:MM"
  onChange: (value: string) => void;
}

export function TimePickerField({ id, value, onChange }: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { placement } = useAdaptivePopup(isOpen, buttonRef);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  // Default to "09:00" if no value selected
  const timeStr = value || "09:00";
  const [hour24, min] = timeStr.split(":").map(Number);

  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  // Local inputs state for typing support
  const [hourInput, setHourInput] = useState(() => String(hour12).padStart(2, "0"));
  const [minInput, setMinInput] = useState(() => String(min).padStart(2, "0"));

  // Synchronize local state with props when picker is opened or props change
  useEffect(() => {
    setHourInput(String(hour12).padStart(2, "0"));
    setMinInput(String(min).padStart(2, "0"));
  }, [value, isOpen]);

  const updateTime = (h: number, m: number) => {
    const hStr = String(h).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    onChange(`${hStr}:${mStr}`);
  };

  const handleHourUp = () => {
    let nextHour24 = hour24 + 1;
    if (nextHour24 > 23) nextHour24 = 0;
    updateTime(nextHour24, min);
  };

  const handleHourDown = () => {
    let nextHour24 = hour24 - 1;
    if (nextHour24 < 0) nextHour24 = 23;
    updateTime(nextHour24, min);
  };

  const handleMinUp = () => {
    let nextMin = min + 15;
    if (nextMin >= 60) nextMin = 0;
    updateTime(hour24, nextMin);
  };

  const handleMinDown = () => {
    let nextMin = min - 15;
    if (nextMin < 0) nextMin = 45;
    updateTime(hour24, nextMin);
  };

  const handleToggleAmPm = () => {
    let nextHour24 = hour24;
    if (isPM) {
      nextHour24 -= 12;
    } else {
      nextHour24 += 12;
    }
    updateTime(nextHour24 % 24, min);
  };

  const handleHourInputChange = (val: string) => {
    // Only allow digits
    const cleaned = val.replace(/\D/g, "");
    setHourInput(cleaned);

    const num = Number(cleaned);
    if (cleaned && num >= 1 && num <= 12) {
      // Calculate 24h hour based on current AM/PM status
      let h24 = num;
      if (isPM && h24 !== 12) {
        h24 += 12;
      } else if (!isPM && h24 === 12) {
        h24 = 0;
      }
      updateTime(h24, min);
    }
  };

  const handleHourInputBlur = () => {
    const num = Number(hourInput);
    if (!hourInput || isNaN(num) || num < 1 || num > 12) {
      // Revert to valid prop state on invalid/empty blur
      setHourInput(String(hour12).padStart(2, "0"));
    } else {
      setHourInput(String(num).padStart(2, "0"));
    }
  };

  const handleMinInputChange = (val: string) => {
    // Only allow digits
    const cleaned = val.replace(/\D/g, "");
    setMinInput(cleaned);

    const num = Number(cleaned);
    if (cleaned && num >= 0 && num <= 59) {
      updateTime(hour24, num);
    }
  };

  const handleMinInputBlur = () => {
    const num = Number(minInput);
    if (!minInput || isNaN(num) || num < 0 || num > 59) {
      // Revert to valid prop state on invalid/empty blur
      setMinInput(String(min).padStart(2, "0"));
    } else {
      setMinInput(String(num).padStart(2, "0"));
    }
  };

  // Convert "HH:MM" 24h to displayable "hh:mm AM/PM"
  const getDisplayTime = () => {
    if (!value) return "Select time...";
    return `${String(hour12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  };

  return (
    <div ref={selectorRef} className="relative w-full">
      <button
        type="button"
        id={id}
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-border bg-transparent px-3 text-left text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted/30",
          isOpen && "border-ring bg-card shadow-sm"
        )}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {getDisplayTime()}
        </span>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-fit",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-border bg-card shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
            {/* Hours Column */}
            <div className="flex flex-col items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleHourUp}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronUp className="size-4 stroke-[3px]" />
              </Button>
              <input
                type="text"
                value={hourInput}
                onChange={(e) => handleHourInputChange(e.target.value)}
                onBlur={handleHourInputBlur}
                className="w-12 h-10 border border-border rounded-md bg-white dark:bg-muted/20 text-center font-normal text-sm text-foreground shadow-sm focus:outline-none focus:border-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleHourDown}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronDown className="size-4 stroke-[3px]" />
              </Button>
            </div>

            {/* Colon Separator */}
            <div className="font-normal text-sm text-foreground mt-1 self-center">:</div>

            {/* Minutes Column */}
            <div className="flex flex-col items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleMinUp}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronUp className="size-4 stroke-[3px]" />
              </Button>
              <input
                type="text"
                value={minInput}
                onChange={(e) => handleMinInputChange(e.target.value)}
                onBlur={handleMinInputBlur}
                className="w-12 h-10 border border-border rounded-md bg-white dark:bg-muted/20 text-center font-normal text-sm text-foreground shadow-sm focus:outline-none focus:border-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleMinDown}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronDown className="size-4 stroke-[3px]" />
              </Button>
            </div>

            <div className="w-1"></div>

            {/* AM/PM Column */}
            <div className="flex flex-col items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleToggleAmPm}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronUp className="size-4 stroke-[3px]" />
              </Button>
              <button
                type="button"
                onClick={handleToggleAmPm}
                className="w-12 h-10 border border-border rounded-md bg-white dark:bg-muted/20 text-center font-normal text-sm text-foreground shadow-sm hover:bg-muted/50 focus:outline-none"
              >
                {isPM ? "PM" : "AM"}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleToggleAmPm}
                className="h-6 w-8 text-foreground hover:bg-transparent"
              >
                <ChevronDown className="size-4 stroke-[3px]" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
