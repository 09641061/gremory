"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";

interface RoleRowProps {
  role: WorkforceRoleSummary;
  selected?: boolean;
  onSelect?: () => void;
}

export function RoleRow({ role, selected = false, onSelect }: RoleRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleId = role.id;
  const canEdit = roleId !== null;
  const canDelete = roleId !== null && !role.systemRole;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      className={`grid cursor-pointer items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_auto] ${selected ? "bg-accent/60" : ""} ${menuOpen ? "relative z-50" : "relative"}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-foreground">
            {role.name}
          </p>
        </div>
      </div>

      <div
        ref={menuRef}
        className="relative flex items-center justify-end gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`More actions for ${role.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <MoreVertical className="size-4" />
        </Button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm"
              disabled={!canEdit}
              onClick={() => {
                setMenuOpen(false);
                setEditSession((value) => value + 1);
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={!canDelete}
              onClick={() => {
                if (!canDelete) return;
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              {role.systemRole ? "Default role" : "Delete"}
            </Button>
          </div>
        ) : null}
      </div>

      {roleId ? (
        <>
          <EditRoleDialog
            key={`${roleId}-${editSession}`}
            role={role}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <DeleteRoleDialog
            roleId={roleId}
            roleName={role.name}
            isSystemRole={role.systemRole}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      ) : null}
    </div>
  );
}
