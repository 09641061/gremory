"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil } from "lucide-react";
import {
  Button,
  buttonVariants,
} from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "../use-selector-menu";

export function OrganizationCardMenu({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useSelectorMenu(open, setOpen, menuRef);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Actions for ${organizationName}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical className="size-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-36 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg">
          <Link
            href={`/organizations/${organizationId}/edit`}
            onClick={() => setOpen(false)}
            className={buttonVariants({
              variant: "ghost",
              className:
                "h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm",
            })}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
