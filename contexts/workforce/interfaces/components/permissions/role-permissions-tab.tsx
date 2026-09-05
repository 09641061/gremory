"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { Lock, Search } from "lucide-react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import {
  groupPermissions,
  isAssistantPermission,
  permissionGroupPriority,
  permissionLabel,
  permissionDescription,
  type PermissionGroup,
} from "./permissions.utils";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

interface RolePermissionsTabProps {
  permissions: ReadonlyArray<WorkforcePermission | string>;
  editable: boolean;
  selectedPermissions: ReadonlySet<string>;
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>;
  permissionFilter: string;
  setPermissionFilter: Dispatch<SetStateAction<string>>;
  assistantLocked?: boolean;
  canUpgradeAssistant?: boolean;
}

export function RolePermissionsTab({
  permissions,
  editable,
  selectedPermissions,
  setSelectedPermissions,
  permissionFilter,
  setPermissionFilter,
  assistantLocked = false,
  canUpgradeAssistant = false,
}: RolePermissionsTabProps) {
  const { t } = useWorkforceTranslations();
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
            placeholder={t.permissions.searchPermissionsPlaceholder}
            aria-label={t.permissions.searchPermissionsLabel}
            className="pl-9"
          />
        </label>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {filteredGroupedPermissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            {t.permissions.noPermissionsFound}
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
                assistantLocked={assistantLocked}
                canUpgradeAssistant={canUpgradeAssistant}
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
  assistantLocked,
  canUpgradeAssistant,
}: {
  permission: string;
  editable: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  assistantLocked: boolean;
  canUpgradeAssistant: boolean;
}) {
  const { t } = useWorkforceTranslations();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const locked = assistantLocked && isAssistantPermission(permission);

  return (
    <>
      <label
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
          checked ? "border-primary/40 bg-accent/50" : "border-border hover:bg-muted/40"
        } ${locked ? "cursor-not-allowed hover:bg-transparent" : ""}`}
        onClick={locked ? () => setUpgradeOpen(true) : undefined}
        aria-disabled={locked}
      >
        <span className="min-w-0 space-y-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="block text-sm font-medium text-foreground">{permissionLabel(permission)}</span>
            {locked ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <Lock className="size-3" aria-hidden="true" />
                {t.permissions.proPlanBadge}
              </Badge>
            ) : null}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{permission}</span>
          <span className="block text-xs text-muted-foreground">{permissionDescription(permission)}</span>
        </span>
        <Switch
          disabled={!editable || locked}
          checked={checked && !locked}
          onCheckedChange={onCheckedChange}
          aria-label={permissionLabel(permission)}
        />
      </label>
      {locked ? (
        <AssistantUpgradeDialog
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          canUpgradeAssistant={canUpgradeAssistant}
        />
      ) : null}
    </>
  );
}

function AssistantUpgradeDialog({
  open,
  onOpenChange,
  canUpgradeAssistant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUpgradeAssistant: boolean;
}) {
  const { t } = useWorkforceTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.permissions.proPlanTitle}</DialogTitle>
          <DialogDescription>
            {t.permissions.proPlanDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {canUpgradeAssistant ? (
            <Button render={<Link href="/upgrade" />} nativeButton={false}>
              {t.permissions.upgradePlan}
            </Button>
          ) : (
            <Button render={<Link href="/upgrade" />} nativeButton={false} variant="ghost">
              {t.permissions.learnMore}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionGroupSection({
  group,
  editable,
  selectedPermissions,
  setSelectedPermissions,
  assistantLocked,
  canUpgradeAssistant,
  headingClassName,
}: {
  group: PermissionGroup;
  editable: boolean;
  selectedPermissions: ReadonlySet<string>;
  setSelectedPermissions: Dispatch<SetStateAction<ReadonlySet<string>>>;
  assistantLocked: boolean;
  canUpgradeAssistant: boolean;
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
            assistantLocked={assistantLocked}
            canUpgradeAssistant={canUpgradeAssistant}
          />
        ))}
      </div>
    </section>
  );
}
