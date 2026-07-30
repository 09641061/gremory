"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Search, Trash2, User } from "lucide-react";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import {
  patchWorkforceRoleAction,
  removeWorkforceRoleAssignmentAction,
} from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { AddMembersDialog } from "./add-members-dialog";

interface PermissionsWorkspaceProps {
  role: WorkforceRoleSummary | null;
  permissions: ReadonlyArray<WorkforcePermission | string>;
  members: ReadonlyArray<TeamUserSummary>;
  onCancel?: () => void;
}

export function PermissionsWorkspace({ role, permissions, members, onCancel }: PermissionsWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"permissions" | "members">("permissions");
  const [selectedPermissions, setSelectedPermissions] = useState<ReadonlySet<string>>(
    new Set(role?.permissions ?? []),
  );
  const [permissionFilter, setPermissionFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    patchWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  const filteredGroupedPermissions = useMemo(() => {
    const normalizedFilter = permissionFilter.trim().toLowerCase();
    const groupedPermissions = groupPermissions(permissions);

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

  const roleMembers = useMemo(() => {
    if (!role) return [];
    return members.filter((member) => member.roles.some((r) => r.id === role.id));
  }, [members, role]);

  const availableMembers = useMemo(() => {
    if (!role) return [];
    return members.filter((member) => !member.roles.some((r) => r.id === role.id));
  }, [members, role]);

  const filteredRoleMembers = useMemo(() => {
    const normalized = memberFilter.trim().toLowerCase();
    if (!normalized) return roleMembers;
    return roleMembers.filter((m) => m.email.toLowerCase().includes(normalized));
  }, [memberFilter, roleMembers]);

  if (!role) {
    return (
      <div className="hidden flex-1 lg:block">
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <User className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select a role</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a role to configure its permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  const editable = !role.systemRole;

  function cancelChanges() {
    setSelectedPermissions(new Set(role?.permissions ?? []));
    onCancel?.();
  }

  const content = (
    <CardContent className="flex min-h-0 flex-1 flex-col p-0">
      <input type="hidden" name="roleId" value={role.id ?? ""} />
      <input type="hidden" name="permissionsSubmitted" value="true" />
      {[...selectedPermissions].map((permission) => (
        <input key={permission} type="hidden" name="permissions" value={permission} />
      ))}

      <div className="flex min-h-0 flex-1 flex-col gap-6 px-6 py-5">
        <ErrorAlert
          title="Unable to save permissions"
          message={state.status === "error" ? state.error : undefined}
        />

        <div className="relative grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm font-medium text-muted-foreground shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center justify-center rounded-md px-3 py-1.5 transition-all ${
              activeTab === "permissions"
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Permissions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex items-center justify-center rounded-md px-3 py-1.5 transition-all ${
              activeTab === "members"
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            }`}
          >
            Manage members
          </button>
        </div>

        {activeTab === "permissions" ? (
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
                filteredGroupedPermissions.map((group) => (
                  <section key={group.label} className="space-y-3">
                    <h3 className="text-sm font-medium capitalize tracking-wide text-muted-foreground">
                      {group.label}
                    </h3>
                    <div className="grid gap-3">
                      {group.permissions.map((permission) => {
                        const checked = selectedPermissions.has(permission);
                        return (
                          <label
                            key={permission}
                            className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${checked ? "border-primary/40 bg-accent/50" : "border-border hover:bg-muted/40"}`}
                          >
                            <span className="min-w-0 space-y-1">
                              <span className="block text-sm font-medium text-foreground">
                                {permissionLabel(permission)}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {permission}
                              </span>
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
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <label className="relative block w-full flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={memberFilter}
                  onChange={(event) => setMemberFilter(event.target.value)}
                  placeholder="Search members"
                  aria-label="Search members"
                  className="pl-9"
                />
              </label>
              <Button
                type="button"
                onClick={() => setAddMembersOpen(true)}
                disabled={!editable}
                className="shrink-0 gap-2 sm:whitespace-nowrap"
              >
                <Plus className="size-4" />
                Add members
              </Button>
            </div>

            {filteredRoleMembers.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <User className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium text-foreground">Manage members</p>
                <p className="mt-1 text-sm text-muted-foreground">This view is currently empty.</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg divide-y divide-border bg-card">
                {filteredRoleMembers.map((member) => (
                  <RoleMemberRow
                    key={member.memberId}
                    roleId={role.id!}
                    member={member}
                    editable={editable}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === "permissions" ? (
        <CardFooter className="shrink-0 justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
          <Button type="button" variant="ghost" onClick={cancelChanges} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || !editable} className="gap-2">
            {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      ) : null}
    </CardContent>
  );

  return (
    <div className="hidden flex-1 lg:block">
      <Card className="rounded-xl border-border bg-card shadow-sm lg:ml-3 lg:h-[calc(100vh-10rem)] flex flex-col">
        {activeTab === "permissions" ? (
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            {content}
          </form>
        ) : (
          content
        )}
      </Card>

      {addMembersOpen && role.id && (
        <AddMembersDialog
          roleId={role.id}
          availableMembers={availableMembers}
          onClose={() => setAddMembersOpen(false)}
        />
      )}
    </div>
  );
}

function RoleMemberRow({
  roleId,
  member,
  editable,
}: {
  roleId: string;
  member: TeamUserSummary;
  editable: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(removeWorkforceRoleAssignmentAction, {
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="flex items-center justify-between p-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-4" />
        </div>
        <span className="truncate text-sm text-foreground font-medium">{member.email}</span>
      </div>

      <form action={formAction} className="shrink-0">
        <input type="hidden" name="roleId" value={roleId} />
        <input type="hidden" name="memberId" value={member.memberId ?? ""} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={pending || !editable}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:hover:bg-transparent"
        >
          {pending ? <Spinner className="size-3" /> : <Trash2 className="size-4" />}
        </Button>
      </form>
    </div>
  );
}


function groupPermissions(permissions: ReadonlyArray<string>) {
  const groups = new Map<string, string[]>();
  for (const permission of permissions) {
    const [context] = permission.split(":");
    const group = groups.get(context) ?? [];
    group.push(permission);
    groups.set(context, group);
  }
  return [...groups.entries()].map(([label, values]) => ({ label, permissions: values }));
}

function permissionLabel(permission: string) {
  const action = permission.split(":").at(-1) ?? permission;
  return action.charAt(0).toUpperCase() + action.slice(1);
}
