"use client";

import { Check } from "lucide-react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { cn } from "@/lib/utils";

import { ROLE_COLOR_PRESETS, isRoleColor } from "./role-color";

/**
 * Visual swatch grid plus a custom picker (native color input + hex field) for the role
 * badge color. Matches the app's design tokens and dark/light themes.
 */
export function RoleColorPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}) {
  const swatchValue = isRoleColor(value) ? value : "#000000";

  return (
    <div className="grid gap-3">
      <div role="radiogroup" aria-label="Role color" className="flex flex-wrap gap-2">
        {ROLE_COLOR_PRESETS.map((hex) => {
          const active = isRoleColor(value) && value.toUpperCase() === hex;
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Color ${hex}`}
              disabled={disabled}
              onClick={() => onChange(hex)}
              className={cn(
                "relative flex size-7 items-center justify-center rounded-full border border-black/10 transition-transform outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-white/15",
                active ? "scale-110 ring-2 ring-ring/60" : "hover:scale-105",
              )}
              style={{ backgroundColor: hex }}
            >
              {active ? <Check className="size-3.5 text-white drop-shadow" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Custom</span>
        <input
          type="color"
          value={swatchValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label="Pick a custom color"
          className="h-8 w-9 cursor-pointer rounded-md border border-input bg-background p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Input
          value={value}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label="Hex color"
          className="h-8 w-28 font-mono text-xs"
        />
      </div>
    </div>
  );
}
