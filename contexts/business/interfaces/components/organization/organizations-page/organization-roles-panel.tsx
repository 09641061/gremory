"use client";

import { Fragment, useEffect, useEffectEvent, useState } from "react";
import { ChevronRight, Cog, Crown, Plus, Trash2, User } from "lucide-react";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/contexts/shared/interfaces/components/ui/accordion";
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
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SEMANTIC_OWNER_ROLE_ID,
  createWorkforceRoleSchema,
  workforceRolePermissionCatalog,
  workforceRoleSchema,
  type WorkforceRolePermission,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";
import { RoleColorPicker } from "@/contexts/workforce/interfaces/components/role-color-picker";
import { DEFAULT_ROLE_COLOR } from "@/contexts/workforce/interfaces/components/role-color";
import { useWorkforceRoleColors } from "@/contexts/workforce/interfaces/components/workforce-role-color-context";
import {
  isForbidden,
  isUnauthenticated,
  redirectToLogin,
} from "@/contexts/shared/infrastructure/http/resource-lifecycle";

type PermissionEntry = { code: WorkforceRolePermission; label: string; description: string };
type PermissionSection = { title: string; permissions: ReadonlyArray<PermissionEntry> };
type PermissionModule = {
  title: string;
  section: "core" | "governance";
  permissions?: ReadonlyArray<PermissionEntry>;
  sections?: ReadonlyArray<PermissionSection>;
};

/** Flattens a module's direct rows and its optional sub-sections. */
function moduleEntries(module: PermissionModule): ReadonlyArray<PermissionEntry> {
  if (module.sections) return module.sections.flatMap((section) => section.permissions);
  return module.permissions ?? [];
}

/** SYSTEM ROLES shows only the editable Member role; Owner is hidden from the editor. */
const SYSTEM_ROLE_ORDER = ["Member"] as const;

function systemRoleRank(name: string): number {
  const rank = SYSTEM_ROLE_ORDER.indexOf(name as (typeof SYSTEM_ROLE_ORDER)[number]);
  return rank === -1 ? SYSTEM_ROLE_ORDER.length : rank;
}

function RoleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = name === "Owner" ? Crown : name === "Member" ? User : Cog;
  return <Icon className={className} aria-hidden="true" />;
}

const permissionModules: ReadonlyArray<PermissionModule> = [
  {
    title: "Catalog",
    section: "core",
    permissions: [
      {
        code: "catalog:manage",
        label: "Manage catalog",
        description:
          "Full management packet: View catalog, create and edit services, activate/deactivate, move categories, and create/edit categories.",
      },
      {
        code: "catalog:delete",
        label: "Delete catalog entries",
        description:
          "Destructive action: Permanently delete services or categories from the system.",
      },
    ],
  },
  {
    title: "CRM & Customers",
    section: "core",
    permissions: [
      {
        code: "crm:customer:manage",
        label: "Manage customer directory",
        description:
          "Full management packet: Search customers, view history/profile, create new records, and edit contact data.",
      },
      {
        code: "crm:customer:delete",
        label: "Delete customers",
        description:
          "Destructive action: Permanently delete customer profiles from the system database.",
      },
      {
        code: "crm:customer:resolve-document",
        label: "Autofill identity data",
        description:
          "API Consumption: Enable the automatic data backfill button using DNI/RUC queries.",
      },
    ],
  },
  {
    title: "Appointments / Schedule",
    section: "core",
    permissions: [
      {
        code: "scheduling:appointment:manage",
        label: "Manage schedule & appointments",
        description:
          "Full operational packet: View calendar grid, book appointments, reschedule/edit fields, and trigger status updates (Start, Complete, No-show).",
      },
      {
        code: "scheduling:appointment:cancel",
        label: "Cancel appointments",
        description:
          "Operational annulment: Cancel appointments while registering a required reason, keeping the data history intact for metrics.",
      },
      {
        code: "scheduling:appointment:delete",
        label: "Delete appointments",
        description:
          "Destructive action: Permanently delete appointment records from the system database.",
      },
    ],
  },
  {
    title: "Assistant",
    section: "core",
    permissions: [
      {
        code: "assistant:use",
        label: "Use AI assistant",
        description:
          "Full interaction packet: Open AI interface, send prompts, create conversations, view sidebar history, and rename chats.",
      },
      {
        code: "assistant:delete",
        label: "Delete conversations",
        description:
          "Destructive action: Permanently delete chat threads or conversation history from the database.",
      },
    ],
  },
  // Organization & governance.
  {
    title: "Organization Settings",
    section: "governance",
    permissions: [
      { code: "organization:read", label: "View organization details", description: "Access and view core corporate metadata." },
      { code: "organization:update", label: "Update organization info", description: "Edit company profile, legal headers, and global logos." },
    ],
  },
  {
    title: "Establishments Management",
    section: "governance",
    permissions: [
      { code: "establishment:read", label: "View establishments", description: "List and browse all physical business locations." },
      { code: "establishment:create", label: "Create new establishments", description: "Provision and open new store profiles under the brand." },
      { code: "establishment:update", label: "Update establishment fields", description: "Edit local time zones, addresses, and individual branch imagery." },
      { code: "establishment:delete", label: "Delete establishments", description: "Destructive action: Permanently delete physical branch profiles from the system." },
    ],
  },
  {
    title: "Team & Workforce",
    section: "governance",
    permissions: [
      { code: "workforce:member:read", label: "View staff directory", description: "Browse the unified team roster and view colleague statuses." },
      { code: "workforce:member:invite", label: "Invite new staff members", description: "Access invitation forms and dispatch new employee clearance setup tokens." },
      { code: "workforce:member:manage", label: "Manage staff status & assignments", description: "In-row fast role assignment, toggle scopes, and revoke active memberships." },
    ],
  },
  {
    title: "Governance & Roles",
    section: "governance",
    permissions: [
      { code: "governance:role:read", label: "View custom roles configuration", description: "Browse organization-specific permission structures and matrices." },
      { code: "governance:role:manage", label: "Manage security matrices & roles", description: "Destructive/Critical action: Create, update checkboxes, and permanently delete system security clearance profiles." },
    ],
  },
];



const NEW_ROLE = "__new__";

/**
 * The immutable Owner role cannot be edited, so it is hidden from the editor entirely:
 * by name ("Owner") or by its reserved semantic id.
 */
function isOwnerRole(role: WorkforceRoleResource): boolean {
  return role.name === "Owner" || role.id === SEMANTIC_OWNER_ROLE_ID;
}

/** Defaults the editor to Member, else the first custom role, never the hidden Owner. */
function defaultSelectionId(roleList: WorkforceRoleResource[]): string {
  return (
    roleList.find((role) => role.systemRole && !isOwnerRole(role))?.id ??
    roleList.find((role) => !role.systemRole)?.id ??
    roleList.find((role) => !isOwnerRole(role))?.id ??
    NEW_ROLE
  );
}

type FormState = {
  name: string;
  permissions: string[];
  color: string;
};

const emptyForm: FormState = { name: "", permissions: [], color: DEFAULT_ROLE_COLOR };

function formForSelection(id: string, roleList: WorkforceRoleResource[]): FormState {
  if (id === NEW_ROLE) return emptyForm;
  const role = roleList.find((candidate) => candidate.id === id);
  return role
    ? { name: role.name, permissions: [...role.permissions], color: role.color ?? DEFAULT_ROLE_COLOR }
    : emptyForm;
}

export function OrganizationRolesPanel({ organizationId }: { organizationId: string }) {
  const { syncRoleColors } = useWorkforceRoleColors();
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<WorkforceRoleResource | null>(null);

  const isCreating = selectedRoleId === NEW_ROLE;
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  // Owner stays fully frozen. Member is a protected-but-editable baseline: its permission
  // matrix is editable, yet it remains a system role and can never be deleted.
  const isOwnerSelected = selectedRole !== null && isOwnerRole(selectedRole);
  const isSystemRole = selectedRole?.systemRole === true;
  const isReadOnly = isOwnerSelected;
  // Factory system-role names are immutable on the backend, so only the name stays locked.
  const isNameLocked = isSystemRole;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const rolesResponse = await fetch("/api/workforce/roles", {
        headers: { "X-Organization-Id": organizationId },
      });
      const rolesBody: unknown = await rolesResponse.json();
      if (isUnauthenticated(rolesResponse.status)) {
        redirectToLogin();
        return;
      }
      if (!rolesResponse.ok) {
        if (isForbidden(rolesResponse.status)) return;
        throw new Error(readErrorMessage(rolesBody));
      }

      const parsedRoles = z.array(workforceRoleSchema).parse(rolesBody);
      setRoles(parsedRoles);
      syncRoleColors(parsedRoles);

      const keepCurrent =
        selectedRoleId.length > 0 &&
        (selectedRoleId === NEW_ROLE ||
          parsedRoles.some((role) => role.id === selectedRoleId && !isOwnerRole(role)));
      const nextId = keepCurrent ? selectedRoleId : defaultSelectionId(parsedRoles);
      setSelectedRoleId(nextId);
      setForm(formForSelection(nextId, parsedRoles));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load roles.");
    } finally {
      setLoading(false);
    }
  }

  const loadInitial = useEffectEvent(() => {
    void loadData();
  });

  useEffect(() => {
    const timer = window.setTimeout(loadInitial, 0);
    return () => window.clearTimeout(timer);
  }, [organizationId]);

  // SYSTEM ROLES renders only the editable Member role; the immutable Owner is hidden.
  const systemRoles = roles
    .filter((role) => role.systemRole && !isOwnerRole(role))
    .sort((a, b) => systemRoleRank(a.name) - systemRoleRank(b.name));
  const customRoles = roles.filter((role) => !role.systemRole);

  function selectRole(id: string) {
    setSelectedRoleId(id);
    setOpenModules([]);
    setError(null);
    setForm(formForSelection(id, roles));
  }

  function startCreate() {
    selectRole(NEW_ROLE);
  }

  function togglePermission(code: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(code)
        ? current.permissions.filter((value) => value !== code)
        : [...current.permissions, code],
    }));
  }

  function toggleModule(module: PermissionModule) {
    const codes = moduleEntries(module).map((permission) => permission.code);
    const allSelected = codes.every((code) => form.permissions.includes(code));
    setForm((current) => ({
      ...current,
      permissions: allSelected
        ? current.permissions.filter((code) => !codes.includes(code as WorkforceRolePermission))
        : [...new Set([...current.permissions, ...codes])],
    }));
  }

  function toggleOpenModule(title: string) {
    setOpenModules((current) =>
      current.includes(title) ? current.filter((value) => value !== title) : [...current, title],
    );
  }

  const baseline = isCreating || !selectedRole
    ? { name: "", permissions: [] as string[], color: DEFAULT_ROLE_COLOR }
    : {
        name: selectedRole.name,
        permissions: [...selectedRole.permissions].sort(),
        color: selectedRole.color ?? DEFAULT_ROLE_COLOR,
      };
  const isDirty =
    form.name.trim() !== baseline.name ||
    [...form.permissions].sort().join(",") !== baseline.permissions.join(",") ||
    form.color.toUpperCase() !== baseline.color.toUpperCase();

  async function saveRole() {
    if (isReadOnly) return;

    const parsed = createWorkforceRoleSchema.safeParse({
      name: form.name,
      permissions: form.permissions.filter((permission) =>
        (workforceRolePermissionCatalog as readonly string[]).includes(permission),
      ),
      color: form.color,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the role details.");
      return;
    }

    // A protected system role (Member) may only change its permissions and color: the
    // backend forbids renaming factory roles, so the name is omitted from the payload.
    const payload = !isCreating && isSystemRole
      ? { permissions: parsed.data.permissions, color: parsed.data.color }
      : parsed.data;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        isCreating ? "/api/workforce/roles" : `/api/workforce/roles/${selectedRole!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
          body: JSON.stringify(payload),
        },
      );
      const body: unknown = response.status === 204 ? undefined : await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));

      const savedRole = workforceRoleSchema.safeParse(body);
      if (savedRole.success) {
        const saved = savedRole.data;
        // Reconcile from the save response instead of refetching the whole roles
        // list: the local list and the shared color dictionary update together, so
        // the members table badges repaint with the new hex color immediately.
        setRoles((current) =>
          current.some((role) => role.id === saved.id)
            ? current.map((role) => (role.id === saved.id ? saved : role))
            : [...current, saved],
        );
        syncRoleColors([saved]);
        setSelectedRoleId(saved.id);
        setOpenModules([]);
        setForm({
          name: saved.name,
          permissions: [...saved.permissions],
          color: saved.color ?? DEFAULT_ROLE_COLOR,
        });
      } else {
        // A 204 or an unexpected payload cannot be reconciled locally; read once.
        await loadData();
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the role.");
    } finally {
      setSaving(false);
    }
  }

  function cancelChanges() {
    if (isCreating || !selectedRole) {
      setForm(emptyForm);
    } else {
      setForm({
        name: selectedRole.name,
        permissions: [...selectedRole.permissions],
        color: selectedRole.color ?? DEFAULT_ROLE_COLOR,
      });
    }
    setOpenModules([]);
    setError(null);
  }

  async function confirmDeleteRole() {
    const role = roleToDelete;
    if (!role || role.systemRole) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/roles/${role.id}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));

      setRoleToDelete(null);
      await loadData();
      selectRole(NEW_ROLE);
    } catch (reason) {
      setRoleToDelete(null);
      setError(reason instanceof Error ? reason.message : "Unable to delete the role.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-4">
        {/* LEFT — internal roles sub-sidebar */}
        <aside className="flex h-full min-h-0 flex-col gap-5 overflow-hidden lg:col-span-1 lg:border-r lg:border-gray-100 lg:pr-6">
          <Button
            type="button"
            onClick={startCreate}
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create custom role
          </Button>

          <div className="flex max-h-[calc(100%-60px)] min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#e5e7eb_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
              System Roles
            </p>
            <nav aria-label="System roles" className="mt-2 flex flex-col gap-1">
              {systemRoles.map((role) => {
                const active = !isCreating && selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => selectRole(role.id)}
                    disabled={loading || saving}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-60",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <RoleIcon name={role.name} className="size-4" />
                    <span className="truncate">{role.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
              Custom Roles
            </p>
            {customRoles.length === 0 ? (
              <p className="mt-2 px-3 text-sm text-muted-foreground">No custom roles yet</p>
            ) : (
              <nav aria-label="Custom roles" className="mt-2 flex flex-col gap-1">
                {customRoles.map((role) => {
                  const active = !isCreating && selectedRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => selectRole(role.id)}
                      disabled={loading || saving}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-60",
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <RoleIcon name={role.name} className="size-4" />
                      <span className="truncate">{role.name}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
          </div>
        </aside>

        {/* RIGHT — role details + permissions matrix */}
        <div className="flex h-full min-h-0 flex-col gap-6 lg:col-span-3">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#e5e7eb_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium" htmlFor="role-name">
          Role Name
          <Input
            id="role-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Front desk"
            maxLength={100}
            disabled={isNameLocked || saving || loading}
          />
        </label>

        <div className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-medium">Badge Color</span>
          <RoleColorPicker
            value={form.color}
            onChange={(hex) => setForm((current) => ({ ...current, color: hex }))}
            disabled={isReadOnly || saving || loading}
          />
        </div>
      </div>

      <Accordion
        multiple
        value={openModules}
        onValueChange={(value) => setOpenModules(value as string[])}
        className="w-full rounded-lg border border-border/70 px-4"
      >
        {permissionModules.map((module, index) => {
          const startsGovernance =
            module.section === "governance" && permissionModules[index - 1]?.section !== "governance";
          const entries = moduleEntries(module);
          const codes = entries.map((permission) => permission.code);
          const selectedCount = codes.filter((code) => form.permissions.includes(code)).length;
          const isOpen = openModules.includes(module.title);
          const renderPermissionRow = ({ code, label, description }: PermissionEntry) => (
            <label
              key={code}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
            >
              <input
                type="checkbox"
                checked={form.permissions.includes(code)}
                onChange={() => togglePermission(code)}
                disabled={isReadOnly || saving || loading}
                className="mt-0.5 size-4 accent-primary"
              />
              <span className="grid gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-foreground">
                  {label}
                  <code className="text-[0.65rem] text-muted-foreground">{code}</code>
                </span>
                <span className="text-xs text-muted-foreground">- {description}</span>
              </span>
            </label>
          );
          return (
            <Fragment key={module.title}>
              {index === 0 ? (
                <p className="pt-3 pb-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  Suite Core Modules
                </p>
              ) : null}
              {startsGovernance ? (
                <p className="mt-2 border-t border-border/70 pt-3 pb-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  Organization &amp; Governance
                </p>
              ) : null}
              <AccordionItem value={module.title}>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleOpenModule(module.title)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left text-sm font-medium text-foreground"
                >
                  <ChevronRight
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")}
                    aria-hidden="true"
                  />
                  <span className="truncate">{module.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({selectedCount}/{codes.length})
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={isReadOnly || saving || loading}
                  onClick={() => toggleModule(module)}
                >
                  Select All
                </Button>
              </div>
              <AccordionContent>
                <div className="grid gap-2 pb-2">
                  {module.sections
                    ? module.sections.map((section, index) => (
                        <div
                          key={section.title}
                          className={cn("grid gap-2", index > 0 && "border-t border-border/70 pt-3")}
                        >
                          <p className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                            {section.title}
                          </p>
                          {section.permissions.map(renderPermissionRow)}
                        </div>
                      ))
                    : (module.permissions ?? []).map(renderPermissionRow)}
                </div>
              </AccordionContent>
              </AccordionItem>
            </Fragment>
          );
        })}
      </Accordion>
          </div>
          </div>

      {/* ZONE 3 — bottom action bar */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {!isSystemRole && !isCreating && selectedRole ? (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={() => setRoleToDelete(selectedRole)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete Role
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <Button type="button" variant="outline" onClick={cancelChanges}>
            Cancel
          </Button>
          {isReadOnly ? (
            <span className="text-sm text-muted-foreground">System roles cannot be modified</span>
          ) : (
            <Button
              type="button"
              onClick={() => void saveRole()}
              disabled={!isDirty || saving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
        </div>
      </div>

      <AlertDialog open={roleToDelete !== null} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{roleToDelete?.name}&quot; role? This action
              cannot be undone and will affect any custom permission flows.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={saving}
              onClick={() => void confirmDeleteRole()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
