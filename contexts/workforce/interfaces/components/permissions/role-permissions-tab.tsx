"use client";

import { Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import {
  groupPermissions,
  permissionGroupPriority,
  permissionLabel,
  permissionDescription,
} from "./permissions.utils";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";

interface PermissionGroup {
  context: string;
  label: string;
  permissions: ReadonlyArray<string>;
}

interface RolePermissionsTabProps {
  permissions: ReadonlyArray<WorkforcePermission | string>;
  editable: boolean;
  selectedPermissions: ReadonlySet<string>;
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>;
  permissionFilter: string;
  setPermissionFilter: Dispatch<SetStateAction<string>>;
}

export function RolePermissionsTab({
  permissions,
  editable,
  selectedPermissions,
  setSelectedPermissions,
  permissionFilter,
  setPermissionFilter,
}: RolePermissionsTabProps) {
  const normalizedFilter = permissionFilter.trim().toLowerCase();
  const groupedPermissions = [...groupPermissions(permissions)].sort((left, right) => {
    const priorityDelta = permissionGroupPriority(left.context) - permissionGroupPriority(right.context);
    if (priorityDelta !== 0) return priorityDelta;
    return left.label.localeCompare(right.label);
  });

  const filteredGroupedPermissions = !normalizedFilter
    ? groupedPermissions
    : groupedPermissions
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter((permission) => {
            return (
              group.label.toLowerCase().includes(normalizedFilter) ||
              permission.toLowerCase().includes(normalizedFilter) ||
              permissionLabel(permission).toLowerCase().includes(normalizedFilter)
            );
          }),
        }))
        .filter((group) => group.permissions.length > 0);

  const establishmentGroup = filteredGroupedPermissions.find((group) => group.context === "establishment") ?? null;
  const moduleGroups = filteredGroupedPermissions.filter((group) => group.context !== "establishment");
  const hasEstablishmentAccess =
    selectedPermissions.has("establishment:read") || selectedPermissions.has("establishment:update");
  const visibleModuleGroups = establishmentGroup ? (hasEstablishmentAccess ? moduleGroups : []) : filteredGroupedPermissions;
  const hasHiddenModulePermissions = Boolean(establishmentGroup && moduleGroups.length > 0 && !hasEstablishmentAccess);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-2 shrink-0">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={permissionFilter}
            onChange={(event) => setPermissionFilter(event.target.value)}
            placeholder="Search permissions"
            aria-label="Search permissions"
            className="pl-9"
          />
        </label>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {filteredGroupedPermissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            No permissions found.
          </div>
        ) : (
          <div className="space-y-6">
            {establishmentGroup ? (
              <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-wide text-foreground">
                      Establishment access
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      These permissions apply only to this establishment.
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[11px] font-medium text-primary">
                    Core access
                  </span>
                </div>

                <div className="grid gap-3">
                  {renderPermissionGroup(establishmentGroup, editable, selectedPermissions, setSelectedPermissions)}
                </div>
              </section>
            ) : null}

            {establishmentGroup ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-foreground">Modules</h3>
                    <p className="text-xs text-muted-foreground">
                      Availability here depends on Organization access.
                    </p>
                  </div>
                </div>

                {hasHiddenModulePermissions ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    Enable <span className="font-medium text-foreground">Business read</span> to
                    reveal the module permissions below.
                  </div>
                ) : null}

                {visibleModuleGroups.length > 0 ? (
                  <div className="space-y-5">
                    {visibleModuleGroups.map((group) => (
                      <PermissionGroupSection
                        key={group.context}
                        group={group}
                        editable={editable}
                        selectedPermissions={selectedPermissions}
                        setSelectedPermissions={setSelectedPermissions}
                        headingClassName="text-sm font-medium tracking-wide text-muted-foreground"
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : (
              filteredGroupedPermissions.map((group) => (
                <PermissionGroupSection
                  key={group.context}
                  group={group}
                  editable={editable}
                  selectedPermissions={selectedPermissions}
                  setSelectedPermissions={setSelectedPermissions}
                  headingClassName="text-sm font-medium capitalize tracking-wide text-muted-foreground"
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderPermissionToggle(
  permission: string,
  editable: boolean,
  selectedPermissions: ReadonlySet<string>,
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>,
) {
  const checked = selectedPermissions.has(permission);

  return (
    <label
      key={permission}
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
        checked ? "border-primary/40 bg-accent/50" : "border-border hover:bg-muted/40"
      }`}
    >
      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-medium text-foreground">{permissionLabel(permission)}</span>
        <span className="block truncate text-xs text-muted-foreground">{permission}</span>
        <span className="block text-xs text-muted-foreground">{permissionDescription(permission)}</span>
      </span>
      <Switch
        disabled={!editable}
        checked={checked}
        onCheckedChange={(nextChecked) => {
          setSelectedPermissions((current) => {
            const next = new Set(current);
            if (nextChecked) next.add(permission);
            else next.delete(permission);
            return next;
          });
        }}
        aria-label={permissionLabel(permission)}
      />
    </label>
  );
}

function renderPermissionGroup(
  group: PermissionGroup,
  editable: boolean,
  selectedPermissions: ReadonlySet<string>,
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>,
) {
  return group.permissions.map((permission) =>
    renderPermissionToggle(permission, editable, selectedPermissions, setSelectedPermissions),
  );
}

function PermissionGroupSection({
  group,
  editable,
  selectedPermissions,
  setSelectedPermissions,
  headingClassName,
}: {
  group: PermissionGroup;
  editable: boolean;
  selectedPermissions: ReadonlySet<string>;
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>;
  headingClassName: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className={headingClassName}>{group.label}</h3>
      <div className="grid gap-3">
        {renderPermissionGroup(group, editable, selectedPermissions, setSelectedPermissions)}
      </div>
    </section>
  );
}
