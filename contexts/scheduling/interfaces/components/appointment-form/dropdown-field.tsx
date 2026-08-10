"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "@/contexts/business/interfaces/components/use-selector-menu";
import { useAdaptivePopup } from "./use-adaptive-popup";
import type { DropdownOption } from "./types";

interface DropdownFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

export function DropdownField({
  id,
  name,
  placeholder,
  value,
  options,
  onChange,
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { placement, maxHeight } = useAdaptivePopup(isOpen, buttonRef);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={selectorRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <Button
        type="button"
        variant="outline"
        id={id}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "h-9 w-full justify-between gap-3 bg-transparent px-3 text-left font-normal text-foreground dark:bg-muted/30",
          isOpen && "border-ring bg-card shadow-sm"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-full",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-xl backdrop-blur">
            <div className="overflow-y-auto p-2" style={{ maxHeight }}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "h-auto min-h-9 w-full justify-between gap-3 rounded-xl px-3 py-2 text-left font-normal",
                      isSelected && "bg-primary/10 ring-1 ring-primary/15"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{option.label}</div>
                      {option.description && (
                        <div className="truncate text-xs text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
