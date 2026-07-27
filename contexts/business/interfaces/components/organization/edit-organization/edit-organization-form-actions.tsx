"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface EditOrganizationFormActionsProps {
  pending: boolean;
}

export function EditOrganizationFormActions({
  pending,
}: EditOrganizationFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-border pt-5">
      <Link href="/organizations" className={buttonVariants({ variant: "ghost" })}>
        Cancel
      </Link>
      <Button type="submit" disabled={pending} className="gap-2">
        {pending && <Spinner data-icon="inline-start" />}
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
