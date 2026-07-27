"use client";

import { CreditCardIcon, ClockIcon } from "lucide-react";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface FinancialsAndLogisticsSectionProps {
  defaultValues?: {
    price?: number;
    durationMinutes?: number;
    preparationMinutes?: number;
    cleanupMinutes?: number;
  };
}

export function FinancialsAndLogisticsSection({ defaultValues }: FinancialsAndLogisticsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Financials */}
      <Card className="rounded-lg border-border bg-card p-6">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <CreditCardIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Financials</h2>
          </div>

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
                defaultValue={defaultValues?.price ?? ""}
                required
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logistics */}
      <Card className="rounded-lg border-border bg-card p-6">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <ClockIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Logistics</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes" className="text-xs">Duration (min)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                placeholder="30"
                defaultValue={defaultValues?.durationMinutes ?? ""}
                required
                className="bg-card border-border text-xs px-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preparationMinutes" className="text-xs">Prep. (min)</Label>
              <Input
                id="preparationMinutes"
                name="preparationMinutes"
                type="number"
                placeholder="5"
                defaultValue={defaultValues?.preparationMinutes ?? 0}
                className="bg-card border-border text-xs px-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cleanupMinutes" className="text-xs">Clean. (min)</Label>
              <Input
                id="cleanupMinutes"
                name="cleanupMinutes"
                type="number"
                placeholder="5"
                defaultValue={defaultValues?.cleanupMinutes ?? 0}
                className="bg-card border-border text-xs px-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
