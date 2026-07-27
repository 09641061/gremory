"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface CreateEstablishmentFormActionsProps {
  pending: boolean;
}

export function CreateEstablishmentFormActions({
  pending,
}: CreateEstablishmentFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-border pt-5">
      <Link href="/establishments" className={buttonVariants({ variant: "ghost" })}>
        Cancel
      </Link>
      <Button type="submit" disabled={pending} className="gap-2">
        {pending && <Spinner data-icon="inline-start" />}
        {pending ? "Creating..." : "Create establishment"}
      </Button>
    </div>
  );
}
