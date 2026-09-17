"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createWorkforceRoleSchema,
  workforceRolePermissionCatalog,
  workforceRoleSchema,
  type WorkforceRolePermission,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

type PermissionModule = {
  title: string;
  permissions: ReadonlyArray<{ code: WorkforceRolePermission; label: string; description: string }>;
};

const permissionModules: ReadonlyArray<PermissionModule> = [
  {
    title: "Catalog",
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
];

const badgeColors = ["Sky", "Violet", "Emerald", "Amber", "Rose"] as const;
type BadgeColor = (typeof badgeColors)[number];

const NEW_ROLE = "__new__";

type FormState = {
  name: string;
  permissions: string[];
  color: BadgeColor;
};

const emptyForm: FormState = { name: "", permissions: [], color: "Sky" };

function formForSelection(id: string, roleList: WorkforceRoleResource[]): FormState {
  if (id === NEW_ROLE) return emptyForm;
  const role = roleList.find((candidate) => candidate.id === id);
  return role ? { name: role.name, permissions: [...role.permissions], color: "Sky" } : emptyForm;
}

export function OrganizationRolesPanel({ organizationId }: { organizationId: string }) {
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
  const isReadOnly = selectedRole?.systemRole === true;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const rolesResponse = await fetch("/api/workforce/roles", {
        headers: { "X-Organization-Id": organizationId },
      });
      const rolesBody: unknown = await rolesResponse.json();
      if (!rolesResponse.ok) throw new Error(readErrorMessage(rolesBody));

      const parsedRoles = z.array(workforceRoleSchema).parse(rolesBody);
      setRoles(parsedRoles);

      const keepCurrent =
        selectedRoleId.length > 0 &&
        (selectedRoleId === NEW_ROLE || parsedRoles.some((role) => role.id === selectedRoleId));
      const nextId = keepCurrent ? selectedRoleId : parsedRoles[0]?.id ?? NEW_ROLE;
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

  const systemRoles = roles.filter((role) => role.systemRole);
  const customRoles = roles.filter((role) => !role.systemRole);
  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));
  const roleOptionLabel = (roleId: string) =>
    roleOptions.find((option) => option.value === roleId)?.label ?? roleId;

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
    const codes = module.permissions.map((permission) => permission.code);
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
    ? { name: "", permissions: [] as string[] }
    : { name: selectedRole.name, permissions: [...selectedRole.permissions].sort() };
  const isDirty =
    form.name.trim() !== baseline.name ||
    [...form.permissions].sort().join(",") !== baseline.permissions.join(",");

  async function saveRole() {
    if (isReadOnly) return;

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
      const response = await fetch(
        isCreating ? "/api/workforce/roles" : `/api/workforce/roles/${selectedRole!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
          body: JSON.stringify(parsed.data),
        },
      );
      const body: unknown = response.status === 204 ? undefined : await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));

      const savedRole = workforceRoleSchema.safeParse(body);
      await loadData();
      if (savedRole.success) selectRole(savedRole.data.id);
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
      setForm({ name: selectedRole.name, permissions: [...selectedRole.permissions], color: "Sky" });
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
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* ZONE 1 — selector + primary action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          items={roleOptions}
          value={isCreating ? null : selectedRoleId || null}
          onValueChange={(next) => selectRole(typeof next === "string" ? next : "")}
          disabled={loading || saving}
        >
          <SelectTrigger aria-label="Select role" className="w-full sm:max-w-md">
            <SelectValue placeholder="Select a role">
              {(value: string | null) => (
                <span className="truncate font-medium text-foreground">
                  {isCreating
                    ? "New Role"
                    : value
                      ? roleOptionLabel(value)
                      : "Select a role"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
                System roles
              </SelectLabel>
              {systemRoles.map((role) => (
                <SelectItem key={role.id} value={role.id} label={roleOptionLabel(role.id)}>
                  <span>{`🛡️ ${role.name}`}</span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
                Custom roles
              </SelectLabel>
              {customRoles.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No custom roles yet</div>
              ) : (
                customRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id} label={roleOptionLabel(role.id)}>
                    <span>{`👤 ${role.name}`}</span>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button type="button" onClick={startCreate} className="gap-2 sm:ml-auto">
          <Plus className="size-4" aria-hidden="true" />
          Create custom role
        </Button>
      </div>

      {/* ZONE 2 — role details + permissions matrix */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium" htmlFor="role-name">
          Role Name
          <Input
            id="role-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Front desk"
            maxLength={100}
            disabled={isReadOnly || saving || loading}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium" htmlFor="role-color">
          Badge Color
          <select
            id="role-color"
            value={form.color}
            onChange={(event) =>
              setForm((current) => ({ ...current, color: event.target.value as BadgeColor }))
            }
            disabled={isReadOnly || saving || loading}
            className="h-(--app-control-height) w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:bg-input/40 disabled:opacity-50"
          >
            {badgeColors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>
      </div>

      <Accordion
        multiple
        value={openModules}
        onValueChange={(value) => setOpenModules(value as string[])}
        className="w-full rounded-lg border border-border/70 px-4"
      >
        {permissionModules.map((module) => {
          const codes = module.permissions.map((permission) => permission.code);
          const selectedCount = codes.filter((code) => form.permissions.includes(code)).length;
          const isOpen = openModules.includes(module.title);
          return (
            <AccordionItem key={module.title} value={module.title}>
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
                  {module.permissions.map(({ code, label, description }) => (
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
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* ZONE 3 — bottom action bar */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {!isReadOnly && !isCreating && selectedRole ? (
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
