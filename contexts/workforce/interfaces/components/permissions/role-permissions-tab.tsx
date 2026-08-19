"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Search } from "lucide-react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import {
  groupPermissions,
  permissionGroupPriority,
  permissionLabel,
  permissionDescription,
  type PermissionGroup,
} from "./permissions.utils";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";

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
  const filteredGroupedPermissions = useMemo(() => {
    const normalizedFilter = permissionFilter.trim().toLowerCase();
    const groupedPermissions = [...groupPermissions(permissions as ReadonlyArray<string>)].sort((left, right) => {
      const priorityDelta = permissionGroupPriority(left.context) - permissionGroupPriority(right.context);
      if (priorityDelta !== 0) return priorityDelta;
      return left.label.localeCompare(right.label);
    });

    if (!normalizedFilter) return groupedPermissions;

    return groupedPermissions
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
  }, [permissionFilter, permissions]);

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
          <div className="space-y-5">
            {filteredGroupedPermissions.map((group) => (
              <PermissionGroupSection
                key={group.context}
                group={group}
                editable={editable}
                selectedPermissions={selectedPermissions}
                setSelectedPermissions={setSelectedPermissions}
                headingClassName="text-sm font-medium capitalize tracking-wide text-muted-foreground"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PermissionToggle({
  permission,
  editable,
  checked,
  onCheckedChange,
}: {
  permission: string;
  editable: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
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
        onCheckedChange={onCheckedChange}
        aria-label={permissionLabel(permission)}
      />
    </label>
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
        {group.permissions.map((permission) => (
          <PermissionToggle
            key={permission}
            permission={permission}
            editable={editable}
            checked={selectedPermissions.has(permission)}
            onCheckedChange={(nextChecked) => {
              setSelectedPermissions((current) => {
                const next = new Set(current);
                if (nextChecked) next.add(permission);
                else next.delete(permission);
                return next;
              });
            }}
          />
        ))}
      </div>
    </section>
  );
}
