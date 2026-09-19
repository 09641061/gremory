"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { ChevronDown, Link2, MapPin, MoreVertical, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
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
  SelectSeparator,
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
  shareableInvitationLinkSchema,
  workforceMemberPageSchema,
  workforceRoleSchema,
  type ShareableInvitationLinkResource,
  type WorkforceMemberResource,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";
import {
  isForbidden,
  isUnauthenticated,
  redirectToLogin,
} from "@/contexts/shared/infrastructure/http/resource-lifecycle";
import { ShareableLinkDialog } from "./organization-shareable-link-dialog";

export type EstablishmentOption = { id: string; name: string };

export type OrganizationRosterMode = "members" | "invites";

export interface OrganizationRosterPanelProps {
  organizationId: string;
  establishments: ReadonlyArray<EstablishmentOption>;
  canInvite?: boolean;
  canManageMembers?: boolean;
  lockedEstablishmentId?: string | null;
  /** "members" lists active members; "invites" lists pending invitations. */
  mode?: OrganizationRosterMode;
}

const ALL_ESTABLISHMENTS = "all";
const ALL_ROLES = "all";
const MEMBER_ROLE_FILTER = "system:member";

export function OrganizationMembersPanel({
  organizationId,
  establishments,
  canInvite = true,
  canManageMembers = true,
  lockedEstablishmentId = null,
  mode = "members",
}: OrganizationRosterPanelProps) {
  const isInvites = mode === "invites";
  const [members, setMembers] = useState<WorkforceMemberResource[]>([]);
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [shareableLinks, setShareableLinks] = useState<ShareableInvitationLinkResource[]>([]);
  const [invitesSubView, setInvitesSubView] = useState<"personal" | "links">("personal");
  const [search, setSearch] = useState("");
  const [establishmentFilter, setEstablishmentFilter] = useState<string>(ALL_ESTABLISHMENTS);
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleMutationKey, setRoleMutationKey] = useState<string | null>(null);
  const [scopeMember, setScopeMember] = useState<WorkforceMemberResource | null>(null);
  const [removeTarget, setRemoveTarget] = useState<WorkforceMemberResource | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<WorkforceMemberResource | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
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

  /**
   * Shareable links have their own lifecycle so a roster/roles parsing issue can never
   * short-circuit the links table (and vice versa).
   */
  async function loadShareableLinks() {
    if (!isInvites) {
      setShareableLinks([]);
      return;
    }
    try {
      const response = await fetch("/api/workforce/invitations/shareable-links", {
        headers: { "X-Organization-Id": organizationId },
      });
      const body: unknown = await response.json().catch(() => undefined);
      if (isUnauthenticated(response.status)) {
        redirectToLogin();
        return;
      }
      console.log("Hydrating Invite Links state with:", body);
      const candidates = extractShareableLinks(body);
      // Parse per item so a single malformed row never empties the whole table.
      const hydrated = candidates.flatMap((candidate) => {
        const result = shareableInvitationLinkSchema.safeParse(candidate);
        return result.success ? [result.data] : [];
      });
      setShareableLinks(response.ok ? hydrated : []);
    } catch (reason) {
      console.error("Unable to load shareable links.", reason);
      setShareableLinks([]);
    }
  }

  const loadInitialLinks = useEffectEvent(() => {
    void loadShareableLinks();
  });

  useEffect(() => {
    if (!isInvites || !organizationId) return;
    const timer = window.setTimeout(loadInitialLinks, 0);
    return () => window.clearTimeout(timer);
  }, [isInvites, organizationId]);

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

  function rolesForLink(link: ShareableInvitationLinkResource): string[] {
    return link.roleIds
      .map((id) => roles.find((role) => role.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }

  function establishmentsForLink(link: ShareableInvitationLinkResource): string[] {
    return link.establishmentIds
      .map((id) => establishments.find((establishment) => establishment.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }

  function linkBaselineLabel(link: ShareableInvitationLinkResource): string {
    const names = rolesForLink(link);
    // roleName is a direct fallback when the backend sends it instead of role ids.
    const base = link.roleName ?? names.find((name) => name === "Member") ?? names[0] ?? "Member";
    return `Role: ${base}`;
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
    if (!member?.userId || member.isOwner || !isUuid(organizationId)) return;

    setLoading(true);
    setError(null);
    try {
      // Organization-wide eviction: purges every establishment membership at once.
      const response = await fetch(
        `/api/workforce/organizations/${organizationId}/members/${member.userId}`,
        { method: "DELETE", headers: { "X-Organization-Id": organizationId } },
      );
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      setRemoveTarget(null);
      setSelectedRowIds((current) => current.filter((id) => id !== rowKey(member)));
      await loadData();
    } catch (reason) {
      setRemoveTarget(null);
      setError(reason instanceof Error ? reason.message : "Unable to remove the member.");
    } finally {
      setLoading(false);
    }
  }

  /** Revokes one pending invitation (DELETE proxy), then removes the row reactively. */
  async function confirmRevokeInvitation() {
    const member = revokeTarget;
    if (!member || !isUuid(organizationId) || !isUuid(member.invitationId)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/invitations/${member.invitationId}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      setRevokeTarget(null);
      setSelectedRowIds((current) => current.filter((id) => id !== rowKey(member)));
      await loadData();
    } catch (reason) {
      setRevokeTarget(null);
      setError(reason instanceof Error ? reason.message : "Unable to revoke the invitation.");
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
  // The two roster views are strictly disjoint: active members vs pending invitations.
  const requiredStatus = isInvites ? "PENDING" : "ACTIVE";
  const visibleMembers = members.filter((member) => {
    const matchesStatus = member.status === requiredStatus;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.email.toLowerCase().includes(normalizedSearch) ||
      (member.username ?? "").toLowerCase().includes(normalizedSearch);
    const matchesEstablishment =
      activeEstablishmentFilter === ALL_ESTABLISHMENTS ||
      scopeFor(member).includes(activeEstablishmentFilter);
    const matchesRole =
      roleFilter === ALL_ROLES ||
      (roleFilter === MEMBER_ROLE_FILTER
        ? member.roles.some((role) => role.systemRole && role.name === "Member")
        : member.roles.some((role) => role.id === roleFilter));
    return matchesStatus && matchesSearch && matchesEstablishment && matchesRole;
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

  const customRoleFilterOptions = roles
    .filter((role) => !role.systemRole)
    .map((role) => ({ value: role.id, label: role.name }));
  const roleFilterOptions = [
    { value: ALL_ROLES, label: "All" },
    { value: MEMBER_ROLE_FILTER, label: "Member" },
    ...customRoleFilterOptions,
  ];
  const roleFilterLabel = (value: string) =>
    roleFilterOptions.find((option) => option.value === value)?.label ?? value;

  const visibleLinks = shareableLinks.filter((link) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      link.url.toLowerCase().includes(normalizedSearch) ||
      rolesForLink(link).some((name) => name.toLowerCase().includes(normalizedSearch)) ||
      establishmentsForLink(link).some((name) => name.toLowerCase().includes(normalizedSearch));
    const matchesEstablishment =
      activeEstablishmentFilter === ALL_ESTABLISHMENTS ||
      link.establishmentIds.length === 0 ||
      link.establishmentIds.includes(activeEstablishmentFilter);
    return matchesSearch && matchesEstablishment;
  });

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
  const selectedPendingRows = selectedRows.filter((member) => member.status === "PENDING");
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

  /** Revokes every selected pending invitation token in one batch, then reloads once. */
  async function revokeSelectedInvitations() {
    const targets = selectedPendingRows.filter((member) => isUuid(member.invitationId));
    if (bulkBusy || !isUuid(organizationId) || targets.length === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      await Promise.all(
        targets.map(async (member) => {
          const response = await fetch(`/api/workforce/invitations/${member.invitationId}`, {
            method: "DELETE",
            headers: { "X-Organization-Id": organizationId },
          });
          if (!response.ok) {
            throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
          }
        }),
      );
      setSelectedRowIds([]);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to revoke the selected invitations.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function copyShareableLink(link: ShareableInvitationLinkResource) {
    try {
      await navigator.clipboard.writeText(link.url);
    } catch {
      setError("Copying is not available in this browser.");
    }
  }

  async function revokeShareableLink(link: ShareableInvitationLinkResource) {
    if (bulkBusy || !isUuid(organizationId)) return;
    setBulkBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/invitations/shareable-links/${link.id}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json().catch(() => undefined)));
      // Optimistically drop the row, then reconcile with the server.
      setShareableLinks((current) => current.filter((item) => item.id !== link.id));
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to revoke the link.");
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
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              isInvites
                ? invitesSubView === "links"
                  ? "Search shareable links..."
                  : "Search invitations..."
                : "Search members..."
            }
            aria-label={
              isInvites
                ? invitesSubView === "links"
                  ? "Search shareable links"
                  : "Search invitations"
                : "Search members"
            }
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

        {!isInvites ? (
          <div className="flex w-full items-center gap-2 lg:max-w-xs">
            <span className="shrink-0 text-sm font-medium text-foreground">Role:</span>
            <Select
              items={roleFilterOptions}
              value={roleFilter}
              onValueChange={(next) => setRoleFilter(typeof next === "string" ? next : ALL_ROLES)}
            >
              <SelectTrigger aria-label="Filter by Role" className="w-full">
                <SelectValue placeholder="All">
                  {(value: string | null) => (
                    <span className="truncate font-medium text-foreground">
                      {roleFilterLabel(value ?? ALL_ROLES)}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ROLES} label="All">
                  All
                </SelectItem>
                <SelectItem value={MEMBER_ROLE_FILTER} label="Member">
                  Member
                </SelectItem>
                <SelectSeparator />
                {customRoleFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} label={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {isInvites && canInvite ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto">
            <Button type="button" variant="outline" onClick={() => setShareLinkOpen(true)} className="gap-2">
              <Link2 className="size-4" aria-hidden="true" />
              Generate Invite Link
            </Button>
            <Button type="button" onClick={() => setInviteOpen(true)} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="size-4" aria-hidden="true" />
              Invite member
            </Button>
          </div>
        ) : null}
      </div>

      {isInvites ? (
        <div
          role="tablist"
          aria-label="Invitation view"
          className="inline-flex w-fit items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={invitesSubView === "personal"}
            onClick={() => {
              setInvitesSubView("personal");
              setSelectedRowIds([]);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              invitesSubView === "personal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Personal Invites
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={invitesSubView === "links"}
            onClick={() => {
              setInvitesSubView("links");
              setSelectedRowIds([]);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              invitesSubView === "links"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Invite Links
          </button>
        </div>
      ) : null}

      {/* Unified staff table */}
      <div className="rounded-lg border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                {isInvites && invitesSubView === "links" ? null : (
                  <Checkbox
                    checked={allSelectableSelected}
                    indeterminate={someSelectableSelected}
                    onCheckedChange={toggleAllSelection}
                    disabled={selectableRowIds.length === 0 || bulkBusy || !canManageMembers}
                    aria-label="Select all members"
                  />
                )}
              </TableHead>
              <TableHead className="px-4">Person / Email</TableHead>
              <TableHead>Assigned Roles</TableHead>
              <TableHead>Establishments Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!isInvites || invitesSubView === "personal" ? visibleMembers : []).map((member) => {
              const owner = member.isOwner;
              const active = member.status === "ACTIVE" && member.memberId !== null;
              const isPending = member.status === "PENDING";
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

                  {/* ⋮ actions: invitations expose resend/revoke; members expose scope/eviction. */}
                  <TableCell className="px-4 text-right">
                    {canManageMembers ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={owner || (!member.memberId && !isPending)}
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
                        {isInvites ? (
                          <>
                            <DropdownMenuItem onClick={() => void resendInvitation(member)}>
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setRevokeTarget(member)}
                            >
                              Revoke Invitation
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              disabled={owner || !member.memberId}
                              onClick={() => setScopeMember(member)}
                            >
                              Edit Establishment Scope
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              className="text-red-600 focus:text-red-600"
                              disabled={owner || !member.userId}
                              onClick={() => setRemoveTarget(member)}
                            >
                              Remove from Organization
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
            {isInvites && invitesSubView === "links"
              ? visibleLinks.map((link) => (
                  <TableRow key={link.id} className="group/row">
                    <TableCell className="w-10 pl-4" />
                    <TableCell className="px-4 py-4 whitespace-normal">
                      <div className="font-medium text-foreground">🔗 Shareable Link</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {linkBaselineLabel(link)}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="text-xs text-muted-foreground">Multi-use token</span>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {establishmentsForLink(link).map((name) => (
                          <Badge key={name} variant="outline" className="gap-1">
                            <MapPin className="size-3" aria-hidden="true" />
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          linkExpirationState(link.expiresAt) === "active"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                            : "border-red-500/40 bg-red-500/10 text-red-600",
                        )}
                      >
                        {linkExpirationLabel(link.expiresAt)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Actions for Shareable Link"
                            />
                          }
                        >
                          <MoreVertical className="size-4" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-52">
                          <DropdownMenuItem onClick={() => void copyShareableLink(link)}>
                            Copy Link URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="text-red-600 focus:text-red-600"
                            onClick={() => void revokeShareableLink(link)}
                          >
                            Revoke Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!loading &&
            (isInvites
              ? invitesSubView === "links"
                ? visibleLinks.length === 0
                : visibleMembers.length === 0
              : visibleMembers.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {isInvites
                    ? invitesSubView === "links"
                      ? "No shareable links found."
                      : "No invitations found."
                    : "No members found."}
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

      {shareLinkOpen ? (
        <ShareableLinkDialog
          organizationId={organizationId}
          establishments={establishments}
          roles={roles}
          onClose={() => setShareLinkOpen(false)}
          onGenerated={() => {
            // Refresh the links cache so the new row appears in the Invite Links view.
            void loadShareableLinks();
            setInvitesSubView("links");
          }}
        />
      ) : null}

      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation sent to{" "}
              {revokeTarget?.email}? The invitation link stops working immediately and the guest can no
              longer join with it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={() => void confirmRevokeInvitation()}
            >
              Revoke Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

            {selectedPendingRows.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={bulkBusy}
                onClick={() => void revokeSelectedInvitations()}
                className="text-red-600 hover:bg-red-500/10 hover:text-red-700 focus-visible:text-red-700"
              >
                Revoke Selected
              </Button>
            ) : null}

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

  // The Owner role is reserved for the organization proprietor and is never assignable
  // through invitations; only Member and operational custom roles are offered.
  const assignableRoles = roles.filter((role) => role.name !== "Owner");
  const assignableRoleOptions = assignableRoles.map((role) => ({
    value: role.id,
    label: role.name,
  }));
  const defaultRole =
    assignableRoles.find((role) => role.name === "Member" && role.systemRole)?.id ??
    assignableRoles[0]?.id ??
    "";
  const roleLabel = (value: string) =>
    assignableRoleOptions.find((option) => option.value === value)?.label ?? "Member";

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

          <div className="grid gap-2">
            <span className="text-sm font-medium">Role</span>
            <Select
              items={assignableRoleOptions}
              value={roleId || defaultRole}
              onValueChange={(next) => setRoleId(typeof next === "string" ? next : "")}
              disabled={submitting}
            >
              <SelectTrigger aria-label="Role" className="w-full">
                <SelectValue placeholder="Member">
                  {(value: string | null) => (
                    <span className="truncate font-medium text-foreground">
                      {roleLabel(value ?? defaultRole)}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {assignableRoleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} label={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

/**
 * Accepts the shareable-links payload whether the backend returns a raw array or wraps
 * it in a container property, so the table never falls back to empty on a shape change.
 */
function extractShareableLinks(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["data", "content", "links", "items", "results"]) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }
  }
  return [];
}

/** Remaining-lifespan countdown label for a shareable link row. */
function linkExpirationLabel(expiresAt: string): string {
  const timestamp = new Date(expiresAt).getTime();
  if (!Number.isFinite(timestamp)) return "NO_EXPIRY";
  const remainingMs = timestamp - Date.now();
  if (remainingMs <= 0) return "EXPIRED";
  const hours = remainingMs / 3_600_000;
  if (hours <= 24) return `EXP_${Math.max(1, Math.ceil(hours))}_HOURS`;
  return `EXP_${Math.ceil(hours / 24)}_DAYS`;
}

/** Expired or nearly-expired links render red; the rest amber. */
function linkExpirationState(expiresAt: string): "active" | "expiring" {
  const timestamp = new Date(expiresAt).getTime();
  if (!Number.isFinite(timestamp)) return "expiring";
  return timestamp - Date.now() > 6 * 3_600_000 ? "active" : "expiring";
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
