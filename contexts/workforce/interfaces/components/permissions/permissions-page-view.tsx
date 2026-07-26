"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { RoleRow } from "./role-row";

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
              <RoleRow key={role.id ?? role.name} role={role} />
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
