"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Save, ShieldCheck } from "lucide-react";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

interface PermissionsWorkspaceProps {
  role: WorkforceRoleSummary | null;
  permissions: ReadonlyArray<WorkforcePermission | string>;
}

export function PermissionsWorkspace({ role, permissions }: PermissionsWorkspaceProps) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<ReadonlySet<string>>(
    new Set(role?.permissions ?? []),
  );
  const [state, formAction, pending] = useActionState(
    patchWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

  if (!role) {
    return (
      <div className="hidden flex-1 lg:block">
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <ShieldCheck className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select a role</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a role to configure its permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  function togglePermission(permission: string) {
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }

  function cancelChanges() {
    setSelectedPermissions(new Set(role?.permissions ?? []));
  }

  return (
    <div className="hidden flex-1 lg:block">
      <div className="min-h-[calc(100vh-10rem)] rounded-xl border border-border bg-card shadow-sm lg:ml-3">
        <Card className="rounded-xl border-0 shadow-none">


          <CardContent className="px-6 py-5">
            <ErrorAlert
              title="Unable to save permissions"
              message={state.status === "error" ? state.error : undefined}
            />
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="roleId" value={role.id ?? ""} />
              <input type="hidden" name="permissionsSubmitted" value="true" />
              {[...selectedPermissions].map((permission) => (
                <input key={permission} type="hidden" name="permissions" value={permission} />
              ))}

              <div className="space-y-5">
                {groupedPermissions.map((group) => (
                  <section key={group.label}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.permissions.map((permission) => {
                        const checked = selectedPermissions.has(permission);
                        return (
                          <label
                            key={permission}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-primary/40 bg-accent/50" : "border-border hover:bg-muted/40"}`}
                          >
                            <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}>
                              {checked ? <Check className="size-3" /> : null}
                            </span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(permission)}
                              className="sr-only"
                              aria-label={permissionLabel(permission)}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-foreground">{permissionLabel(permission)}</span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{permission}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
                <Button type="button" variant="ghost" onClick={cancelChanges} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="gap-2">
                  {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                  {pending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
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
