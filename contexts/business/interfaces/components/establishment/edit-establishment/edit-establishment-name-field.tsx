"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface EditEstablishmentNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditEstablishmentNameField({
  value,
  onChange,
}: EditEstablishmentNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="establishment-name">Name</Label>
      <Input
        id="establishment-name"
        name="name"
        required
        maxLength={100}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
