"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

export function CreateEstablishmentNameField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="establishment-name">Name</Label>
      <Input
        id="establishment-name"
        name="name"
        required
        maxLength={100}
        placeholder="e.g. Downtown store"
        autoComplete="organization"
      />
    </div>
  );
}
