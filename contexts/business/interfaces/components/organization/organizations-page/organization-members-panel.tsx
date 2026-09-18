"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { ChevronDown, MapPin, MoreVertical, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
import { z } from "zod";

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
import { Checkbox } from "@/contexts/shared/interfaces/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/contexts/shared/interfaces/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import { cn } from "@/lib/utils";
import {
  createWorkforceInvitationSchema,
  isUuid,
  workforceMemberPageSchema,
  workforceRoleSchema,
  type WorkforceMemberResource,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";
import {
  isForbidden,
  isUnauthenticated,
  redirectToLogin,
} from "@/contexts/shared/infrastructure/http/resource-lifecycle";

export type EstablishmentOption = { id: string; name: string };

const ALL_ESTABLISHMENTS = "all";

export function OrganizationMembersPanel({
  organizationId,
  establishments,
  canInvite = true,
  canManageMembers = true,
  lockedEstablishmentId = null,
}: {
  organizationId: string;
  establishments: ReadonlyArray<EstablishmentOption>;
  canInvite?: boolean;
  canManageMembers?: boolean;
  lockedEstablishmentId?: string | null;
}) {
  const [members, setMembers] = useState<WorkforceMemberResource[]>([]);
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [search, setSearch] = useState("");
  const [establishmentFilter, setEstablishmentFilter] = useState<string>(ALL_ESTABLISHMENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleMutationKey, setRoleMutationKey] = useState<string | null>(null);
  const [scopeMember, setScopeMember] = useState<WorkforceMemberResource | null>(null);
  const [removeTarget, setRemoveTarget] = useState<WorkforceMemberResource | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [membersResponse, rolesResponse] = await Promise.all([
        fetch("/api/workforce/members?page=0&size=100", {
          headers: { "X-Organization-Id": organizationId },
        }),
        fetch("/api/workforce/roles", { headers: { "X-Organization-Id": organizationId } }),
      ]);
      const membersBody: unknown = await membersResponse.json();
      const rolesBody: unknown = await rolesResponse.json();
      // A refreshed/expired session is handled silently; only real errors surface.
      if (isUnauthenticated(membersResponse.status) || isUnauthenticated(rolesResponse.status)) {
        redirectToLogin();
        return;
      }
      if (!membersResponse.ok) {
        if (isForbidden(membersResponse.status)) return;
        throw new Error(readErrorMessage(membersBody));
      }
      if (!rolesResponse.ok) {
        if (isForbidden(rolesResponse.status)) return;
        throw new Error(readErrorMessage(rolesBody));
      }

      const refreshedMembers = workforceMemberPageSchema.parse(membersBody).content;
      setMembers(refreshedMembers);
      // Drop selections that no longer resolve to a visible row after a reload.
      setSelectedRowIds((current) =>
        current.filter((id) => refreshedMembers.some((member) => rowKey(member) === id)),
      );
      setRoles(z.array(workforceRoleSchema).parse(rolesBody));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load the team.");
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

  function scopeFor(member: WorkforceMemberResource): string[] {
    const scope = member.establishments.map((establishment) => establishment.id);
    return scope.length > 0 ? scope : [member.establishmentId];
  }

  /** Exactly one mandatory system role per staff row (Owner, Admin or Member). */
  function primarySystemRole(member: WorkforceMemberResource): WorkforceRoleResource | null {
    const systemRoles = member.roles.filter((role) => role.systemRole);
    if (systemRoles.length === 0) return null;
    return [...systemRoles].sort((a, b) => a.position - b.position)[0];
  }

  function customRoles(member: WorkforceMemberResource): WorkforceRoleResource[] {
    return member.roles.filter((role) => !role.systemRole);
  }

  const swappableSystemRoles = roles
    .filter((role) => role.systemRole && role.name !== "Owner")
    .sort((a, b) => a.position - b.position);
  const assignableCustomRoles = roles.filter((role) => !role.systemRole);

  /**
   * Guards a role mutation against a missing row/member id or a stale synthetic
   * role id (for example a legacy placeholder) before it reaches the proxy, which
   * would otherwise answer with a raw 400.
   */
  function canMutateRole(member: WorkforceMemberResource, roleId: string): boolean {
    return Boolean(member.memberId) && isUuid(organizationId) && isUuid(roleId);
  }

  const ROLE_MUTATION_BLOCKED = "This role can no longer be updated. Refresh the page and try again.";

  async function swapSystemRole(member: WorkforceMemberResource, roleId: string) {
    if (!canMutateRole(member, roleId)) {
      setError(ROLE_MUTATION_BLOCKED);
      return;
    }
    const current = member.roles.find((role) => role.systemRole && role.name !== "Owner");
    if (current?.id === roleId) return;

    console.log("Submitting role change payload:", { organizationId, memberId: member.memberId, roleId });
    setRoleMutationKey(`${member.memberId}:system`);
    setError(null);
    try {
      if (current && isUuid(current.id)) {
        const removal = await fetch(
          `/api/workforce/roles/members/${member.memberId}/${current.id}`,
          { method: "DELETE", headers: { "X-Organization-Id": organizationId } },
        );
        if (!removal.ok) throw new Error(readErrorMessage(await removal.json().catch(() => undefined)));
      }
      const assignment = await fetch(`/api/workforce/roles/members/${member.memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({ roleId }),
      });
      if (!assignment.ok) throw new Error(readErrorMessage(await assignment.json().catch(() => undefined)));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the system role.");
    } finally {
      setRoleMutationKey(null);
    }
  }

  async function assignRole(member: WorkforceMemberResource, roleId: string) {
    if (!canMutateRole(member, roleId)) {
      setError(ROLE_MUTATION_BLOCKED);
      return;
    }
    console.log("Submitting role change payload:", { organizationId, memberId: member.memberId, roleId });
    setRoleMutationKey(`${member.memberId}:${roleId}`);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/roles/members/${member.memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({ roleId }),
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to assign the role.");
    } finally {
      setRoleMutationKey(null);
    }
  }

  async function removeRole(member: WorkforceMemberResource, roleId: string) {
    if (!canMutateRole(member, roleId)) {
      setError(ROLE_MUTATION_BLOCKED);
      return;
    }
    console.log("Submitting role change payload:", { organizationId, memberId: member.memberId, roleId });
    setRoleMutationKey(`${member.memberId}:${roleId}`);
    setError(null);
    try {
      const response = await fetch(
        `/api/workforce/roles/members/${member.memberId}/${roleId}`,
        { method: "DELETE", headers: { "X-Organization-Id": organizationId } },
      );
      if (isUnauthenticated(response.status)) {
        redirectToLogin();
        return;
      }
      if (isForbidden(response.status)) return;
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      // Optimistically drop the tag from the row so the UI updates instantly.
      setMembers((current) =>
        current.map((entry) =>
          rowKey(entry) === rowKey(member)
            ? { ...entry, roles: entry.roles.filter((role) => role.id !== roleId) }
            : entry,
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove the role.");
    } finally {
      setRoleMutationKey(null);
    }
  }

  async function resendInvitation(member: WorkforceMemberResource) {
    setError(null);
    try {
      const response = await fetch(`/api/workforce/invitations/${member.invitationId}/resend`, {
        method: "POST",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to resend the invitation.");
    }
  }

  async function confirmRemoveMember() {
    const member = removeTarget;
    if (!member?.memberId || member.isOwner) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/members/${member.memberId}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      setRemoveTarget(null);
      await loadData();
    } catch (reason) {
      setRemoveTarget(null);
      setError(reason instanceof Error ? reason.message : "Unable to remove the member.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScope(member: WorkforceMemberResource, ids: string[]) {
    if (!member.memberId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/members/${member.memberId}/scope`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({ establishmentIds: ids }),
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      setScopeMember(null);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the scope.");
    } finally {
      setLoading(false);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();
  // Establishment-scoped viewers are locked to their own store: the filter is hidden
  // and every row is restricted to that location.
  const activeEstablishmentFilter = lockedEstablishmentId ?? establishmentFilter;
  const visibleMembers = members.filter((member) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.email.toLowerCase().includes(normalizedSearch) ||
      (member.username ?? "").toLowerCase().includes(normalizedSearch);
    const matchesEstablishment =
      activeEstablishmentFilter === ALL_ESTABLISHMENTS ||
      scopeFor(member).includes(activeEstablishmentFilter);
    return matchesSearch && matchesEstablishment;
  });

  const establishmentFilterOptions = [
    { value: ALL_ESTABLISHMENTS, label: "All" },
    ...establishments.map((establishment) => ({
      value: establishment.id,
      label: establishment.name,
    })),
  ];
  const establishmentFilterLabel = (value: string) =>
    establishmentFilterOptions.find((option) => option.value === value)?.label ?? value;

  // Bulk selection spans every operational row (active memberships and pending
  // invitations). Only the system Owner is excluded, so the root proprietor profile
  // can never be mutated in a batch.
  const selectableRowIds = visibleMembers
    .filter((member) => !member.isOwner)
    .map((member) => rowKey(member));
  const allSelectableSelected =
    selectableRowIds.length > 0 && selectableRowIds.every((id) => selectedRowIds.includes(id));
  const someSelectableSelected =
    !allSelectableSelected && selectableRowIds.some((id) => selectedRowIds.includes(id));
  const selectedRows = members.filter((member) => selectedRowIds.includes(rowKey(member)));
  const bulkSelectionActive = selectedRowIds.length >= 2;

  function toggleRowSelection(rowId: string) {
    setSelectedRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
  }

  function toggleAllSelection() {
    setSelectedRowIds((current) => {
      if (selectableRowIds.length === 0) return current;
      if (selectableRowIds.every((id) => current.includes(id))) {
        return current.filter((id) => !selectableRowIds.includes(id));
      }
      return Array.from(new Set([...current, ...selectableRowIds]));
    });
  }

  /** Replaces a pending invitation's base system role while keeping its custom roles. */
  function invitationRolesWithBase(member: WorkforceMemberResource, baseRoleId: string): string[] {
    const customRoleIds = member.roles.filter((role) => !role.systemRole).map((role) => role.id);
    return Array.from(new Set([...customRoleIds, baseRoleId]));
  }

  /** Appends a role to a pending invitation's existing role mapping. */
  function invitationRolesWithAdded(member: WorkforceMemberResource, roleId: string): string[] {
    return Array.from(new Set([...member.roles.map((role) => role.id), roleId]));
  }

  async function updateInvitationRoleMapping(member: WorkforceMemberResource, roleIds: string[]) {
    const response = await fetch(`/api/workforce/invitations/${member.invitationId}/roles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
      body: JSON.stringify({ roleIds: roleIds.filter((id) => isUuid(id)) }),
    });
    if (!response.ok) {
      throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
    }
  }

  /**
   * Batch-swaps the base system role for every selected row. Active memberships swap the
   * persisted assignment; pending invitations re-map the roles granted on acceptance.
   * One reactive reload runs after the whole batch settles, then the checkboxes clear.
   */
  async function changeBaseRoleForSelection(roleId: string) {
    if (bulkBusy || !isUuid(organizationId) || !isUuid(roleId) || selectedRows.length === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      await Promise.all(
        selectedRows.map(async (member) => {
          if (!member.memberId) {
            // Pending invitation: swap the base role, keep any custom roles.
            await updateInvitationRoleMapping(member, invitationRolesWithBase(member, roleId));
            return;
          }
          const current = member.roles.find((role) => role.systemRole && role.name !== "Owner");
          if (current?.id === roleId) return;
          if (current && isUuid(current.id)) {
            const removal = await fetch(
              `/api/workforce/roles/members/${member.memberId}/${current.id}`,
              { method: "DELETE", headers: { "X-Organization-Id": organizationId } },
            );
            if (!removal.ok) {
              throw new Error(readErrorMessage(await removal.json().catch(() => undefined)));
            }
          }
          const assignment = await fetch(`/api/workforce/roles/members/${member.memberId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
            body: JSON.stringify({ roleId }),
          });
          if (!assignment.ok) {
            throw new Error(readErrorMessage(await assignment.json().catch(() => undefined)));
          }
        }),
      );
      setSelectedRowIds([]);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to change the base role.");
    } finally {
      setBulkBusy(false);
    }
  }

  /** Appends a custom role to every selected row that does not already hold it. */
  async function addCustomRoleToSelection(roleId: string) {
    if (bulkBusy || !isUuid(organizationId) || !isUuid(roleId) || selectedRows.length === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      await Promise.all(
        selectedRows.map(async (member) => {
          if (member.roles.some((role) => role.id === roleId)) return;
          if (!member.memberId) {
            // Pending invitation: append to the roles granted on acceptance.
            await updateInvitationRoleMapping(member, invitationRolesWithAdded(member, roleId));
            return;
          }
          const response = await fetch(`/api/workforce/roles/members/${member.memberId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
            body: JSON.stringify({ roleId }),
          });
          if (!response.ok) {
            throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
          }
        }),
      );
      setSelectedRowIds([]);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add the custom role.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members..."
            aria-label="Search members"
            className="pl-9"
          />
        </div>

        {lockedEstablishmentId ? null : (
        <div className="flex w-full items-center gap-2 lg:max-w-xs">
          <span className="shrink-0 text-sm font-medium text-foreground">Establishment:</span>
          <Select
            items={establishmentFilterOptions}
            value={establishmentFilter}
            onValueChange={(next) =>
              setEstablishmentFilter(typeof next === "string" ? next : ALL_ESTABLISHMENTS)
            }
          >
            <SelectTrigger aria-label="Filter by Establishment" className="w-full">
              <SelectValue placeholder="All">
                {(value: string | null) => (
                  <span className="truncate font-medium text-foreground">
                    {establishmentFilterLabel(value ?? ALL_ESTABLISHMENTS)}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {establishmentFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} label={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        )}

        {canInvite ? (
          <Button type="button" onClick={() => setInviteOpen(true)} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 lg:ml-auto">
            <Plus className="size-4" aria-hidden="true" />
            Invite member
          </Button>
        ) : null}
      </div>

      {/* Unified staff table */}
      <div className="rounded-lg border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelectableSelected}
                  indeterminate={someSelectableSelected}
                  onCheckedChange={toggleAllSelection}
                  disabled={selectableRowIds.length === 0 || bulkBusy || !canManageMembers}
                  aria-label="Select all members"
                />
              </TableHead>
              <TableHead className="px-4">Person / Email</TableHead>
              <TableHead>Assigned Roles</TableHead>
              <TableHead>Establishments Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleMembers.map((member) => {
              const owner = member.isOwner;
              const active = member.status === "ACTIVE" && member.memberId !== null;
              const systemRole = primarySystemRole(member);
              const customs = customRoles(member);
              const busy = roleMutationKey !== null;
              return (
                <TableRow key={rowKey(member)} className="group/row">
                  <TableCell className="w-10 pl-4">
                    <Checkbox
                      checked={selectedRowIds.includes(rowKey(member))}
                      onCheckedChange={() => toggleRowSelection(rowKey(member))}
                      disabled={owner || bulkBusy || !canManageMembers}
                      aria-label={`Select ${member.username ?? member.email}`}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-normal">
                    <div className="font-medium text-foreground">{member.username ?? member.email}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{member.email}</div>
                  </TableCell>

                  {/* Organization Roles: removable inline tags plus a trailing add popover. */}
                  <TableCell className="whitespace-normal">
                    {systemRole || customs.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {systemRole ? (
                          // System roles (Owner/Admin/Member) are the protected base clearance:
                          // they swap through the add popover, never through an inline removal.
                          <Badge variant={owner ? "default" : "secondary"} className="gap-1">
                            <ShieldCheck className="size-3" aria-hidden="true" />
                            {systemRole.name}
                          </Badge>
                        ) : null}
                        {customs.map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className={cn("gap-1", active && canManageMembers && "pr-1")}
                          >
                            {role.name}
                            {active && canManageMembers ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void removeRole(member, role.id)}
                                aria-label={`Remove ${role.name} role`}
                                title={`Remove ${role.name} role`}
                                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                              >
                                <X className="size-3" aria-hidden="true" />
                              </button>
                            ) : null}
                          </Badge>
                        ))}
                        {!owner && active && canManageMembers ? (
                          <DropdownMenu onOpenChange={(open) => { if (!open) setError(null); }}>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-xs"
                                  aria-label="Add role"
                                  title="Add role"
                                  disabled={busy}
                                />
                              }
                            >
                              <Plus className="size-3" aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>System role</DropdownMenuLabel>
                                {swappableSystemRoles.map((role) => (
                                  <DropdownMenuItem
                                    key={role.id}
                                    disabled={busy || !isUuid(role.id)}
                                    onClick={() => void swapSystemRole(member, role.id)}
                                  >
                                    {systemRole?.id === role.id ? "✓ " : ""}
                                    {role.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Custom roles</DropdownMenuLabel>
                                {assignableCustomRoles.length === 0 ? (
                                  <DropdownMenuItem disabled>No custom roles yet</DropdownMenuItem>
                                ) : (
                                  assignableCustomRoles.map((role) => {
                                    const assigned = member.roles.some((assignedRole) => assignedRole.id === role.id);
                                    return (
                                      <DropdownMenuItem
                                        key={role.id}
                                        disabled={busy || !isUuid(role.id)}
                                        onClick={() =>
                                          assigned ? void removeRole(member, role.id) : void assignRole(member, role.id)
                                        }
                                      >
                                        {assigned ? "✓ " : ""}
                                        {role.name}
                                      </DropdownMenuItem>
                                    );
                                  })
                                )}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {active ? "No role" : "Awaiting acceptance"}
                      </span>
                    )}
                  </TableCell>

                  {/* Establishments Scope: read-only location tags; editing lives in the ⋮ menu. */}
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {owner ? (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="size-3" aria-hidden="true" />
                          All Establishments
                        </Badge>
                      ) : (
                        scopeFor(member).map((id) => (
                          <Badge key={id} variant="outline" className="gap-1">
                            <MapPin className="size-3" aria-hidden="true" />
                            {member.establishments.find((establishment) => establishment.id === id)?.name ??
                              establishments.find((establishment) => establishment.id === id)?.name ??
                              member.establishmentName ??
                              "Establishment"}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                        }
                      >
                        {active ? "ACTIVE" : member.status}
                      </Badge>
                      {member.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => void resendInvitation(member)}
                          className="hidden text-xs font-medium text-primary underline-offset-4 hover:underline group-hover/row:inline"
                        >
                          Resend
                        </button>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Standardized ⋮ actions: scope editing and total revocation only.
                      Hidden for establishment-scoped members without member management. */}
                  <TableCell className="px-4 text-right">
                    {canManageMembers ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={owner || !member.memberId}
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${member.username ?? member.email}`}
                            title={owner ? "Owner is protected" : undefined}
                          />
                        }
                      >
                        <MoreVertical className="size-4" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-52">
                        <DropdownMenuItem
                          disabled={owner || !member.memberId}
                          onClick={() => setScopeMember(member)}
                        >
                          Edit Establishment Scope
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          className="text-red-600 focus:text-red-600"
                          disabled={owner || !member.memberId}
                          onClick={() => setRemoveTarget(member)}
                        >
                          Remove from Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && visibleMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <MemberScopeDialog
        key={scopeMember?.invitationId ?? "scope-none"}
        member={scopeMember}
        establishments={establishments}
        initialScope={scopeMember ? scopeFor(scopeMember) : []}
        onClose={() => setScopeMember(null)}
        onSave={saveScope}
      />

      <InviteMemberDialog
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        organizationId={organizationId}
        establishments={establishments}
        roles={roles}
        onInvited={() => void loadData()}
      />

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeTarget?.username ?? removeTarget?.email} from the
              organization? Every role and establishment access is revoked. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={() => void confirmRemoveMember()}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canManageMembers && bulkSelectionActive ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/70 bg-background/95 py-1.5 pr-1.5 pl-4 shadow-lg ring-1 ring-foreground/5 backdrop-blur">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="size-4 text-muted-foreground" aria-hidden="true" />
              {selectedRowIds.length} members selected
            </span>
            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

            <Popover>
              <PopoverTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" disabled={bulkBusy} className="gap-1" />
                }
              >
                Change Base Role
                <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent align="center" side="top" className="w-56 gap-0.5 p-1.5">
                {swappableSystemRoles.length === 0 ? (
                  <p className="px-2.5 py-2 text-sm text-muted-foreground">No assignable system roles</p>
                ) : (
                  swappableSystemRoles.map((role) => (
                    <BulkRoleOption
                      key={role.id}
                      label={role.name}
                      disabled={bulkBusy || !isUuid(role.id)}
                      onSelect={() => void changeBaseRoleForSelection(role.id)}
                    />
                  ))
                )}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" disabled={bulkBusy} className="gap-1" />
                }
              >
                Add Custom Role
                <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent align="center" side="top" className="w-56 gap-0.5 p-1.5">
                {assignableCustomRoles.length === 0 ? (
                  <p className="px-2.5 py-2 text-sm text-muted-foreground">No custom roles yet</p>
                ) : (
                  assignableCustomRoles.map((role) => (
                    <BulkRoleOption
                      key={role.id}
                      label={role.name}
                      disabled={bulkBusy || !isUuid(role.id)}
                      onSelect={() => void addCustomRoleToSelection(role.id)}
                    />
                  ))
                )}
              </PopoverContent>
            </Popover>

            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRowIds([])}
              disabled={bulkBusy}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BulkRoleOption({
  label,
  disabled,
  onSelect,
}: {
  label: string;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function MemberScopeDialog({
  member,
  establishments,
  initialScope,
  onClose,
  onSave,
}: {
  member: WorkforceMemberResource | null;
  establishments: ReadonlyArray<EstablishmentOption>;
  initialScope: string[];
  onClose: () => void;
  onSave: (member: WorkforceMemberResource, ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initialScope);

  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Edit Establishment Scope</DialogTitle>
          <DialogDescription>
            Choose where {member?.username ?? member?.email} can operate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {establishments.map((establishment) => {
            const checked = selected.includes(establishment.id);
            return (
              <label key={establishment.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(establishment.id)
                        ? current.filter((id) => id !== establishment.id)
                        : [...current, establishment.id],
                    )
                  }
                  className="size-4 accent-primary"
                />
                {establishment.name}
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={() => member && onSave(member, selected)}>Save Scope</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteMemberDialog({
  isOpen,
  onClose,
  organizationId,
  establishments,
  roles,
  onInvited,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  establishments: ReadonlyArray<EstablishmentOption>;
  roles: ReadonlyArray<WorkforceRoleResource>;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allEstablishments, setAllEstablishments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultRole = roles.find((role) => role.name === "Member" && role.systemRole)?.id ?? roles[0]?.id ?? "";

  function reset() {
    setEmail("");
    setRoleId(defaultRole);
    setSelectedIds([]);
    setAllEstablishments(true);
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function submit() {
    const targetEstablishments = allEstablishments
      ? establishments.map((establishment) => establishment.id)
      : selectedIds;
    const parsed = createWorkforceInvitationSchema.safeParse({
      establishmentIds: targetEstablishments,
      email: email.trim(),
      roleIds: roleId ? [roleId] : [],
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the invite details.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/workforce/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      onInvited();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
        else reset();
      }}
    >
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>Send an invitation to join this organization.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium" htmlFor="invite-email">
            Email
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              disabled={submitting}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium" htmlFor="invite-role">
            Role
            <select
              id="invite-role"
              value={roleId || defaultRole}
              onChange={(event) => setRoleId(event.target.value)}
              disabled={submitting}
              className="h-(--app-control-height) w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} [{role.systemRole ? "System" : "Custom"}]
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Establishment Access</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={allEstablishments}
                onChange={() => setAllEstablishments((current) => !current)}
                disabled={submitting}
                className="size-4 accent-primary"
              />
              All establishments
            </label>
            {!allEstablishments
              ? establishments.map((establishment) => (
                  <label key={establishment.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(establishment.id)}
                      onChange={() =>
                        setSelectedIds((current) =>
                          current.includes(establishment.id)
                            ? current.filter((id) => id !== establishment.id)
                            : [...current, establishment.id],
                        )
                      }
                      disabled={submitting}
                      className="size-4 accent-primary"
                    />
                    {establishment.name}
                  </label>
                ))
              : null}
          </fieldset>

          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={submitting}>Cancel</Button>
          <Button type="button" onClick={() => void submit()} disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
            {submitting ? "Sending..." : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function rowKey(member: WorkforceMemberResource): string {
  return member.memberId ?? member.invitationId;
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
