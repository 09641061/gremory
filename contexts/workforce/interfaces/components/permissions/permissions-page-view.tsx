"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { RoleRow } from "./role-row";
import { PermissionsWorkspace } from "./permissions-workspace";

export function PermissionsPageView({
  roles,
  permissions,
}: {
  roles: ReadonlyArray<WorkforceRoleSummary>;
  permissions: ReadonlyArray<string>;
}) {
  const [filter, setFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createSession, setCreateSession] = useState(0);
  const [editingRole, setEditingRole] = useState<WorkforceRoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<WorkforceRoleSummary | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const filteredRoles = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(normalizedFilter));
  }, [filter, roles]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      <div className="w-full space-y-6 lg:flex-1 lg:flex lg:flex-col lg:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Permissions</h1>
            <p className="page-description mt-2">
              Search, create, and manage the team roles available in your account.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
          <label className="relative block w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search roles"
              aria-label="Search roles"
              className="pl-9"
            />
          </label>
          <Button
            type="button"
            size="default"
            onClick={() => setCreateOpen(true)}
            className="shrink-0 gap-2 sm:whitespace-nowrap"
          >
            <Plus className="size-4" />
            Create role
          </Button>
        </div>

        <CreateRoleDialog
          key={createSession}
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setCreateSession((session) => session + 1);
          }}
        />

        {editingRole ? (
          <EditRoleDialog
            key={editingRole.id}
            role={editingRole}
            open={!!editingRole}
            onOpenChange={(open) => {
              if (!open) setEditingRole(null);
            }}
          />
        ) : null}

        {deletingRole && deletingRole.id ? (
          <DeleteRoleDialog
            key={deletingRole.id}
            roleId={deletingRole.id}
            roleName={deletingRole.name}
            isSystemRole={deletingRole.systemRole}
            open={!!deletingRole}
            onOpenChange={(open) => {
              if (!open) setDeletingRole(null);
            }}
          />
        ) : null}

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
              <span>Roles - {roles.length}</span>
              <span className="pr-1">Actions</span>
            </div>

            <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {filteredRoles.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground">
                  No roles found.
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <RoleRow
                    key={role.id ?? role.name}
                    role={role}
                    selected={role.id === selectedRoleId}
                    onSelect={() => role.id && setSelectedRoleId(role.id)}
                    onEdit={(selectedRole) => setEditingRole(selectedRole)}
                    onDelete={(selectedRole) => setDeletingRole(selectedRole)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PermissionsWorkspace
        key={selectedRole?.id ?? "empty"}
        role={selectedRole}
        permissions={permissions}
        onCancel={() => setSelectedRoleId(null)}
      />
    </section>
  );
}
