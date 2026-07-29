"use client";

import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

interface InstructionsSectionProps {
  defaultValues?: {
    preServiceInstructions?: string | null;
    postServiceRecommendations?: string | null;
  };
}

export function InstructionsSection({ defaultValues }: InstructionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preServiceInstructions">Pre-service</Label>
          <Textarea
            id="preServiceInstructions"
            name="preServiceInstructions"
            rows={2}
            placeholder="e.g. Arrive 5 minutes prior..."
            defaultValue={defaultValues?.preServiceInstructions ?? ""}
            className="min-h-[60px] max-h-[200px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postServiceRecommendations">Post-service</Label>
          <Textarea
            id="postServiceRecommendations"
            name="postServiceRecommendations"
            rows={2}
            placeholder="e.g. Avoid washing hair for 12 hours..."
            defaultValue={defaultValues?.postServiceRecommendations ?? ""}
            className="min-h-[60px] max-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
