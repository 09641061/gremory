"use client";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";

interface EditOrganizationNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditOrganizationNameField({
  value,
  onChange,
}: EditOrganizationNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="organization-name">Name</Label>
      <Input
        id="organization-name"
        name="name"
        required
        maxLength={150}
        autoComplete="organization"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
