"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface FinancialsAndLogisticsSectionProps {
  defaultValues?: {
    price?: number;
    durationMinutes?: number;
    preparationMinutes?: number;
    cleanupMinutes?: number;
  };
  disabled?: boolean;
}

// Zero is shown as an empty field so typing over it doesn't produce values like "05".
// The server action coerces the empty prep/cleanup fields back to 0.
function numberFieldValue(value?: number) {
  return value ? String(value) : "";
}

export function FinancialsAndLogisticsSection({ defaultValues, disabled }: FinancialsAndLogisticsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Financials */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={numberFieldValue(defaultValues?.price)}
              required
              className="pl-10 bg-card border-border"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="space-y-4">

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes" className="text-xs">Duration (min)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              placeholder="30"
              defaultValue={numberFieldValue(defaultValues?.durationMinutes)}
              required
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preparationMinutes" className="text-xs">Prep. (min)</Label>
            <Input
              id="preparationMinutes"
              name="preparationMinutes"
              type="number"
              placeholder="0"
              defaultValue={numberFieldValue(defaultValues?.preparationMinutes)}
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cleanupMinutes" className="text-xs">Clean. (min)</Label>
            <Input
              id="cleanupMinutes"
              name="cleanupMinutes"
              type="number"
              placeholder="0"
              defaultValue={numberFieldValue(defaultValues?.cleanupMinutes)}
              className="bg-card border-border text-xs px-2"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
