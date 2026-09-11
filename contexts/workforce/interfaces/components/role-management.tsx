"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { usePermissions } from "@/contexts/workforce/interfaces/hooks/usePermissions";
import { useWorkspaceAuth } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import {
  createWorkforceRoleSchema,
  workforceRolePermissionCatalog,
  workforceRoleSchema,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

type FormState = {
  name: string;
  permissions: string[];
};

const permissionLabels: Record<(typeof workforceRolePermissionCatalog)[number], string> = {
  "workforce:read_members": "View team members",
  "workforce:invite": "Invite members",
  "workforce:revoke_invitation": "Revoke invitations",
  "workforce:assign_roles": "Assign roles",
  "workforce:manage_members": "Manage members",
};

export function RoleManagement() {
  const { hasPermission } = usePermissions();
  const authorization = useWorkspaceAuth();
  const organizationId = authorization?.scope.organizationId;
  const canManageRoles = hasPermission("workforce:manage_roles");
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [editingRole, setEditingRole] = useState<WorkforceRoleResource | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", permissions: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = useEffectEvent(async () => {
    if (!organizationId || !canManageRoles) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/workforce/roles", {
        headers: { "X-Organization-Id": organizationId },
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));
      setRoles(z.array(workforceRoleSchema).parse(body));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load roles.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!organizationId || !canManageRoles) return;
    const timer = window.setTimeout(loadRoles, 0);
    return () => window.clearTimeout(timer);
  }, [organizationId, canManageRoles]);

  if (!canManageRoles) {
    return (
      <PageShell>
        <PageHeader title="Role management" description="Control what each custom role can do." />
        <Card>
          <CardContent className="space-y-3 p-7 text-center">
            <ShieldCheck className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have permission to manage roles in this workspace.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  function startCreate() {
    setEditingRole(null);
    setForm({ name: "", permissions: [] });
    setError(null);
  }

  function startEdit(role: WorkforceRoleResource) {
    setEditingRole(role);
    setForm({ name: role.name, permissions: [...role.permissions] });
    setError(null);
  }

  function togglePermission(permission: string) {
    if (editingRole?.systemRole) return;
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((value) => value !== permission)
        : [...current.permissions, permission],
    }));
  }

  async function saveRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || editingRole?.systemRole) return;

    const parsed = createWorkforceRoleSchema.safeParse({
      name: form.name,
      permissions: form.permissions.filter((permission) =>
        (workforceRolePermissionCatalog as readonly string[]).includes(permission),
      ),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the role details.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const isEditing = editingRole !== null;
      const response = await fetch(
        isEditing ? `/api/workforce/roles/${editingRole.id}` : "/api/workforce/roles",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
          body: JSON.stringify(parsed.data),
        },
      );
      const body: unknown = response.status === 204 ? undefined : await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));
      const savedRole = workforceRoleSchema.parse(body);
      setRoles((current) => isEditing
        ? current.map((role) => role.id === savedRole.id ? savedRole : role)
        : [...current, savedRole]);
      startCreate();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the role.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRole(role: WorkforceRoleResource) {
    if (!organizationId || role.systemRole) return;
    if (!window.confirm(`Delete the ${role.name} role?`)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/roles/${role.id}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json()));
      setRoles((current) => current.filter((item) => item.id !== role.id));
      if (editingRole?.id === role.id) startCreate();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete the role.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Role management"
        description="Create custom roles with only the workforce permissions they need."
        actions={
          <Button type="button" onClick={startCreate} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            New role
          </Button>
        }
      />

      {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle className="flex items-center justify-between gap-4">
              <span>Organization roles</span>
              {loading ? <span className="text-xs font-normal text-muted-foreground">Updating...</span> : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-5">Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="px-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        {role.systemRole ? <ShieldCheck className="size-4 text-muted-foreground" aria-label="System role" /> : null}
                        {role.name}
                        {role.systemRole ? <Badge variant="secondary">System</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal">
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>)}
                        {role.permissions.length === 0 ? <span className="text-sm text-muted-foreground">No permissions</span> : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(role)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          {role.systemRole ? "View" : "Edit"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={role.systemRole}
                          onClick={() => void deleteRole(role)}
                          aria-label={`Delete ${role.name}`}
                          title={role.systemRole ? "System roles cannot be deleted" : "Delete role"}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && roles.length === 0 ? <TableRow><TableCell colSpan={3} className="px-5 py-12 text-center text-muted-foreground">No roles found.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b border-border/70">
            <CardTitle>{editingRole ? `${editingRole.systemRole ? "View" : "Edit"} role` : "Create role"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(event) => void saveRole(event)}>
              <label className="grid gap-2 text-sm font-medium" htmlFor="role-name">
                Role name
                <Input
                  id="role-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  disabled={editingRole?.systemRole || saving}
                  placeholder="e.g. Front desk"
                  maxLength={100}
                />
              </label>

              <fieldset disabled={editingRole?.systemRole || saving} className="space-y-3">
                <legend className="text-sm font-medium">Workforce permissions</legend>
                <p className="text-xs leading-5 text-muted-foreground">Choose only the access this role requires.</p>
                <div className="grid gap-2">
                  {workforceRolePermissionCatalog.map((permission) => {
                    const checked = form.permissions.includes(permission);
                    return (
                      <label key={permission} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(permission)}
                          disabled={editingRole?.systemRole || saving}
                          className="size-4 accent-primary"
                        />
                        <span>{permissionLabels[permission]}</span>
                        <code className="ml-auto text-[0.65rem] text-muted-foreground">{permission}</code>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {editingRole?.systemRole ? <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">System roles are protected and cannot be changed.</p> : null}
              <div className="flex gap-2 border-t border-border/70 pt-4">
                {editingRole ? <Button type="button" variant="outline" onClick={startCreate}>Cancel</Button> : null}
                <Button type="submit" disabled={Boolean(editingRole?.systemRole) || saving} className="ml-auto">
                  {saving ? "Saving..." : editingRole ? "Save changes" : "Create role"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
