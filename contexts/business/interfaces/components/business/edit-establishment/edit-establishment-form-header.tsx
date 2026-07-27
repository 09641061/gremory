"use client";

import { Store } from "lucide-react";

interface EditEstablishmentFormHeaderProps {
  title: string;
  description: string;
}

export function EditEstablishmentFormHeader({
  title,
  description,
}: EditEstablishmentFormHeaderProps) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-description mt-2">{description}</p>
    </div>
  );
}

export function EditEstablishmentSectionTitle() {
  return (
    <div className="flex items-center gap-2">
      <Store className="size-5 text-muted-foreground" />
      <span>Establishment details</span>
    </div>
  );
}
