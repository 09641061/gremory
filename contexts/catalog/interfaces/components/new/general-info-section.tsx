"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

interface GeneralInfoSectionProps {
  defaultValues?: {
    name?: string;
    description?: string;
  };
  disabled?: boolean;
}

export function GeneralInfoSection({ defaultValues, disabled }: GeneralInfoSectionProps) {
  return (
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
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Describe main service details..."
          defaultValue={defaultValues?.description ?? ""}
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}
