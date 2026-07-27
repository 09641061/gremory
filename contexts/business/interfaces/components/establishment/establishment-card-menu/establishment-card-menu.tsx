"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  buttonVariants,
} from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "../../use-selector-menu";
import { DeleteEstablishmentDialog } from "../delete-establishment-dialog/delete-establishment-dialog";

export function EstablishmentCardMenu({
  establishmentId,
  establishmentName,
}: {
  establishmentId: string;
  establishmentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useSelectorMenu(open, setOpen, menuRef);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Actions for ${establishmentName}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical className="size-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
          <Link
            href={`/establishments/${establishmentId}/edit`}
            onClick={() => setOpen(false)}
            prefetch={false}
            className={buttonVariants({
              variant: "ghost",
              className:
                "h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm",
            })}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setOpen(false);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      )}

      <DeleteEstablishmentDialog
        establishmentId={establishmentId}
        establishmentName={establishmentName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
