"use client";

import { Building2 } from "lucide-react";

interface EditOrganizationFormHeaderProps {
  title: string;
  description: string;
}

export function EditOrganizationFormHeader({
  title,
  description,
}: EditOrganizationFormHeaderProps) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-description mt-2">{description}</p>
    </div>
  );
}

export function EditOrganizationSectionTitle() {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="size-5 text-muted-foreground" />
      <span>Organization details</span>
    </div>
  );
}
