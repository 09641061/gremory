"use client";

import { InfoIcon } from "lucide-react";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface GeneralInfoSectionProps {
  categories: Array<{ id: string; name: string }>;
  defaultValues?: {
    name?: string;
    description?: string;
    categoryId?: string | null;
  };
}

export function GeneralInfoSection({ categories, defaultValues }: GeneralInfoSectionProps) {
  return (
    <Card className="rounded-lg border-border bg-card p-6">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <InfoIcon className="size-5 text-[#00b77a]" />
          <h2 className="text-lg font-semibold text-foreground">General Information</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Executive Haircut"
              defaultValue={defaultValues?.name}
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
              defaultValue={defaultValues?.description}
              required
              className="w-full rounded-md border border-border bg-card p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b77a]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaultValues?.categoryId ?? ""}
              className="w-full h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b77a]"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
