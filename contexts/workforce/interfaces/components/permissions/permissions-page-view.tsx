"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { CreateRoleDialog } from "./create-role-dialog";
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
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id ?? null);
  const filteredRoles = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(normalizedFilter));
  }, [filter, roles]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      <div className="w-full space-y-8 lg:flex-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Permissions</h1>
            <p className="page-description mt-2">
              Search, create, and manage the team roles available in your account.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
          <Button type="button" onClick={() => setCreateOpen(true)} className="gap-2">
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

        <Card className="overflow-visible rounded-xl border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground">
              <span>Roles - {roles.length}</span>
              <span className="pr-1">Actions</span>
            </div>

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
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <PermissionsWorkspace
        key={selectedRole?.id ?? "empty"}
        role={selectedRole}
        permissions={permissions}
      />
    </section>
  );
}
