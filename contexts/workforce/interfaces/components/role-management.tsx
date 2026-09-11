"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2, UserMinus } from "lucide-react";
import { z } from "zod";

import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/contexts/shared/interfaces/components/ui/tabs";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { usePermissions } from "@/contexts/workforce/interfaces/hooks/usePermissions";
import { useWorkspaceAuth } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import {
  createWorkforceRoleSchema,
  workforceMemberPageSchema,
  workforceRolePermissionCatalog,
  workforceRoleSchema,
  type WorkforceMemberResource,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

type FormState = {
  name: string;
  permissions: string[];
};

type EditorTab = "permissions" | "members";

const permissionLabels: Record<(typeof workforceRolePermissionCatalog)[number], string> = {
  "workforce:read_members": "View team members",
  "workforce:invite": "Invite members",
  "workforce:revoke_invitation": "Revoke invitations",
  "workforce:assign_roles": "Assign roles",
  "workforce:manage_members": "Manage members",
};

export function RoleManagement({ embedded = false }: { embedded?: boolean } = {}) {
  const { hasPermission } = usePermissions();
  const authorization = useWorkspaceAuth();
  const organizationId = authorization?.scope.organizationId;
  const canManageRoles = hasPermission("workforce:manage_roles");
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [members, setMembers] = useState<WorkforceMemberResource[]>([]);
  const [editingRole, setEditingRole] = useState<WorkforceRoleResource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<WorkforceRoleResource | null>(null);
  const isDeleteOpen = roleToDelete !== null;
  const [editorTab, setEditorTab] = useState<EditorTab>("permissions");
  const [form, setForm] = useState<FormState>({ name: "", permissions: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [memberMutationId, setMemberMutationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    if (!organizationId || !canManageRoles) return;

    setLoading(true);
    setError(null);
    try {
      const [rolesResponse, membersResponse] = await Promise.all([
        fetch("/api/workforce/roles", { headers: { "X-Organization-Id": organizationId } }),
        fetch("/api/workforce/members?page=0&size=100", {
          headers: { "X-Organization-Id": organizationId },
        }),
      ]);
      const rolesBody: unknown = await rolesResponse.json();
      const membersBody: unknown = await membersResponse.json();
      if (!rolesResponse.ok) throw new Error(readErrorMessage(rolesBody));
      if (!membersResponse.ok) throw new Error(readErrorMessage(membersBody));

      setRoles(z.array(workforceRoleSchema).parse(rolesBody));
      setMembers(workforceMemberPageSchema.parse(membersBody).content);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load roles.");
    } finally {
      setLoading(false);
    }
  }

  const loadInitialData = useEffectEvent(() => {
    void loadData();
  });

  useEffect(() => {
    if (!organizationId || !canManageRoles) return;
    const timer = window.setTimeout(loadInitialData, 0);
    return () => window.clearTimeout(timer);
  }, [organizationId, canManageRoles]);

  if (!canManageRoles) {
    const denied = (
      <Card>
        <CardContent className="space-y-3 p-7 text-center">
          <ShieldCheck className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have permission to manage roles in this workspace.
          </p>
        </CardContent>
      </Card>
    );

    return embedded ? denied : (
      <PageShell>
        <PageHeader title="Role management" description="Control what each custom role can do." />
        {denied}
      </PageShell>
    );
  }

  function countMembersForRole(roleId: string): number {
    return members.filter((member) => member.roles.some((role) => role.id === roleId)).length;
  }

  function membersForRole(roleId: string): WorkforceMemberResource[] {
    return members.filter((member) => member.roles.some((role) => role.id === roleId));
  }

  function startCreate() {
    setEditingRole(null);
    setIsCreating(true);
    setEditorTab("permissions");
    setForm({ name: "", permissions: [] });
    setError(null);
  }

  function startEdit(role: WorkforceRoleResource) {
    setEditingRole(role);
    setIsCreating(false);
    setEditorTab("permissions");
    setForm({ name: role.name, permissions: [...role.permissions] });
    setError(null);
  }

  function cancelEditing() {
    setEditingRole(null);
    setIsCreating(false);
    setEditorTab("permissions");
    setForm({ name: "", permissions: [] });
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
      startEdit(savedRole);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the role.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteRole() {
    const role = roleToDelete;
    if (!organizationId || !role || role.systemRole) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/roles/${role.id}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json()));
      setRoles((current) => current.filter((item) => item.id !== role.id));
      if (editingRole?.id === role.id) {
        setEditingRole(null);
        setIsCreating(false);
      }
      setRoleToDelete(null);
    } catch (reason) {
      setRoleToDelete(null);
      setError(reason instanceof Error ? reason.message : "Unable to delete the role.");
    } finally {
      setLoading(false);
    }
  }

  async function assignMemberToRole(member: WorkforceMemberResource) {
    if (!organizationId || !editingRole || !member.memberId) return;

    setMemberMutationId(member.memberId);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/roles/members/${member.memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({ roleId: editingRole.id }),
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add the member to the role.");
    } finally {
      setMemberMutationId(null);
    }
  }

  async function removeMemberFromRole(member: WorkforceMemberResource) {
    if (!organizationId || !editingRole || !member.memberId) return;

    setMemberMutationId(member.memberId);
    setError(null);
    try {
      const response = await fetch(
        `/api/workforce/roles/members/${member.memberId}/${editingRole.id}`,
        { method: "DELETE", headers: { "X-Organization-Id": organizationId } },
      );
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove the member from the role.");
    } finally {
      setMemberMutationId(null);
    }
  }

  const roleMembers = editingRole ? membersForRole(editingRole.id) : [];
  const assignableMembers = editingRole
    ? members.filter(
        (member) =>
          member.memberId !== null &&
          !member.roles.some((role) => role.id === editingRole.id),
      )
    : [];

  const permissionsForm = (
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
        {editingRole || isCreating ? (
          <Button type="button" variant="outline" onClick={cancelEditing}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={Boolean(editingRole?.systemRole) || saving} className="ml-auto">
          {saving ? "Saving..." : editingRole ? "Save changes" : "Create role"}
        </Button>
      </div>
    </form>
  );

  const body = (
    <>
      {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
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
                  <TableHead className="px-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        {role.systemRole ? <ShieldCheck className="size-4 text-muted-foreground" aria-label="System role" /> : null}
                        <span>{role.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">({countMembersForRole(role.id)})</span>
                        {role.systemRole ? <Badge variant="secondary">System</Badge> : null}
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
                          onClick={() => setRoleToDelete(role)}
                          aria-label={`Delete ${role.name}`}
                          title={role.systemRole ? "System roles cannot be deleted" : "Delete role"}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && roles.length === 0 ? <TableRow><TableCell colSpan={2} className="px-5 py-12 text-center text-muted-foreground">No roles found.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {editingRole || isCreating ? (
            <CardHeader className="border-b border-border/70">
              <CardTitle>{editingRole ? `${editingRole.systemRole ? "View" : "Edit"} role` : "Create role"}</CardTitle>
            </CardHeader>
          ) : null}
          <CardContent>
            {editingRole ? (
              <Tabs
                value={editorTab}
                onValueChange={(value) => setEditorTab(value as EditorTab)}
                className="w-full"
              >
                <TabsList variant="line" className="mb-4 w-full justify-start gap-6 border-b border-border">
                  <TabsTrigger
                    value="permissions"
                    className="flex-none rounded-none border-b-2 border-transparent px-0 pt-1 pb-2 text-sm font-medium text-muted-foreground transition-colors after:hidden hover:text-foreground data-active:border-b-foreground data-active:text-foreground"
                  >
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="flex-none rounded-none border-b-2 border-transparent px-0 pt-1 pb-2 text-sm font-medium text-muted-foreground transition-colors after:hidden hover:text-foreground data-active:border-b-foreground data-active:text-foreground"
                  >
                    Members ({roleMembers.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="permissions">{permissionsForm}</TabsContent>

                <TabsContent value="members">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {roleMembers.length} {roleMembers.length === 1 ? "member" : "members"} with this role
                      </p>
                      {!editingRole.systemRole ? (
                        <SearchableOptions
                          options={assignableMembers.map((member) => ({
                            id: member.memberId as string,
                            name: member.username ?? member.email,
                          }))}
                          onSelect={(option) => {
                            const member = assignableMembers.find((candidate) => candidate.memberId === option.id);
                            if (member) void assignMemberToRole(member);
                          }}
                          allLabel="Add Members"
                          searchPlaceholder="Search members..."
                          emptyMessage="No members available."
                          triggerClassName="gap-2 rounded-lg border border-input px-3"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                          Add Members
                        </SearchableOptions>
                      ) : null}
                    </div>

                    {roleMembers.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                        No members have this role yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
                        {roleMembers.map((member) => (
                          <li
                            key={member.memberId ?? member.invitationId}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{member.username ?? member.email}</p>
                              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            {!editingRole.systemRole ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={memberMutationId === member.memberId}
                                onClick={() => void removeMemberFromRole(member)}
                                aria-label={`Remove ${member.username ?? member.email} from ${editingRole.name}`}
                              >
                                <UserMinus className="size-4" aria-hidden="true" />
                              </Button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}

                    {editingRole.systemRole ? (
                      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        System roles are protected; their members cannot be changed.
                      </p>
                    ) : null}
                  </div>
                </TabsContent>
              </Tabs>
            ) : isCreating ? (
              permissionsForm
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </div>
                <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                  Select an organization role from the list to view and manage its permissions.
                </p>
                <Button type="button" onClick={startCreate} className="gap-2">
                  <Plus className="size-4" aria-hidden="true" />
                  Create new role
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{roleToDelete?.name}&quot; role? This action
              cannot be undone and will affect any custom permission flows.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={() => void confirmDeleteRole()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (embedded) return body;

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
      {body}
    </PageShell>
  );
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
