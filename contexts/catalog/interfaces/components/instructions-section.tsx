"use client";

import { ClipboardListIcon } from "lucide-react";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface InstructionsSectionProps {
  defaultValues?: {
    preServiceInstructions?: string | null;
    postServiceRecommendations?: string | null;
  };
}

export function InstructionsSection({ defaultValues }: InstructionsSectionProps) {
  return (
    <Card className="rounded-lg border-border bg-card p-6">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <ClipboardListIcon className="size-5 text-[#00b77a]" />
          <h2 className="text-lg font-semibold text-foreground">Instructions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preServiceInstructions">Pre-service</Label>
            <textarea
              id="preServiceInstructions"
              name="preServiceInstructions"
              rows={2}
              placeholder="e.g. Arrive 5 minutes prior..."
              defaultValue={defaultValues?.preServiceInstructions ?? ""}
              className="w-full rounded-md border border-border bg-card p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b77a]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postServiceRecommendations">Post-service</Label>
            <textarea
              id="postServiceRecommendations"
              name="postServiceRecommendations"
              rows={2}
              placeholder="e.g. Avoid washing hair for 12 hours..."
              defaultValue={defaultValues?.postServiceRecommendations ?? ""}
              className="w-full rounded-md border border-border bg-card p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b77a]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
