"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { deleteWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function PermissionsPageView({
  roles,
}: {
  roles: ReadonlyArray<WorkforceRoleSummary>;
}) {
  const [filter, setFilter] = useState("");
  const filteredRoles = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(normalizedFilter));
  }, [filter, roles]);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Permissions</h1>
          <p className="page-description mt-2">
            Search, create, and manage the team roles available in your account.
          </p>
        </div>
        <Link
          href="/permissions/new"
          className={buttonVariants({ className: "gap-2 self-start sm:self-auto" })}
        >
          <Plus className="size-4" />
          Create role
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative block w-full max-w-[440px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search roles"
            aria-label="Search roles"
            className="h-9 pl-9"
          />
        </label>
      </div>

      <Card className="overflow-visible rounded-xl border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span>Role</span>
            <span className="pr-1">Actions</span>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted-foreground">
              No roles found.
            </div>
          ) : (
            filteredRoles.map((role) => (
              <RoleRow key={role.id ?? role.name} role={role} />
            ))
          )}

          <div className="border-t border-border px-5 py-5 text-sm text-muted-foreground">
            {roles.length} {roles.length === 1 ? "role" : "roles"}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function RoleRow({ role }: { role: WorkforceRoleSummary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleId = role.id;
  const canEdit = roleId !== null;

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
    <div className="grid items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-foreground">
            {role.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {role.permissions.length}{" "}
            {role.permissions.length === 1 ? "permission" : "permissions"}
          </p>
        </div>
      </div>

      <div ref={menuRef} className="relative flex items-center justify-end gap-2">
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
          <div className="absolute right-0 top-full z-40 mt-1 w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
            <Link
              href={canEdit ? `/permissions/${roleId}/edit` : "/permissions"}
              aria-disabled={!canEdit}
              tabIndex={canEdit ? 0 : -1}
              onClick={(event) => {
                if (!canEdit) {
                  event.preventDefault();
                }
                setMenuOpen(false);
              }}
              className={buttonVariants({
                variant: "ghost",
                className: "h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm",
              })}
            >
              Edit
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {roleId ? (
        <DeleteRoleDialog
          roleId={roleId}
          roleName={role.name}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      ) : null}
    </div>
  );
}

function DeleteRoleDialog({
  roleId,
  roleName,
  open,
  onOpenChange,
}: {
  roleId: string;
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  return (
    <AlertDialog open={open && state.status !== "success"} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{roleName}</span>.
            </AlertDialogDescription>
            {state.status === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <input type="hidden" name="roleId" value={roleId} />
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
