"use client";

import { InfoIcon } from "lucide-react";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface GeneralInfoSectionProps {
  defaultValues?: {
    name?: string;
    description?: string;
  };
}

export function GeneralInfoSection({ defaultValues }: GeneralInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <InfoIcon className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">General Information</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Executive Haircut"
            defaultValue={defaultValues?.name ?? ""}
            required
            className="bg-card border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Describe main service details..."
            defaultValue={defaultValues?.description ?? ""}
            required
            className="w-full rounded-md border border-border bg-card p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
