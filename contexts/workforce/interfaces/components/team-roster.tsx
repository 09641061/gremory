"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert, UserRoundCog } from "lucide-react";

import type { PageResponse } from "@/contexts/shared/application/model/page-response";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
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
import {
  workforceMemberPageSchema,
  type WorkforceMemberResource,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";
import { useWorkspaceAuth } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import { usePermissions } from "@/contexts/workforce/interfaces/hooks/usePermissions";
import { InviteMemberButton } from "@/contexts/workforce/interfaces/components/invite-member-button";
import { InviteMembersDialog } from "@/contexts/workforce/interfaces/components/invite-members-dialog";
import { PendingInvitationsList } from "@/contexts/workforce/interfaces/components/pending-invitations-list";

const pageSize = 20;

export function TeamRoster({ establishmentId = null }: { establishmentId?: string | null }) {
  const authorization = useWorkspaceAuth();
  const { hasPermission } = usePermissions();
  const organizationId = authorization?.scope.organizationId;
  const effectivePermissions = authorization?.effectivePermissions ?? [];
  const canRead = hasPermission("workforce:read_members");
  const canInvite = hasPermission("workforce:invite");
  const canAssignRoles = hasPermission("workforce:assign_roles");
  const canManageMembers = hasPermission("workforce:manage_members");
  const [roster, setRoster] = useState<PageResponse<WorkforceMemberResource> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<WorkforceMemberResource | null>(null);
  const [roles, setRoles] = useState<WorkforceRoleResource[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkforceMemberResource | null>(null);
  const isRemoveConfirmOpen = memberToRemove !== null;
  const [activeTab, setActiveTab] = useState<"members" | "pending">("members");

  const logCurrentPermissions = useEffectEvent(() => {
    console.log("Current permissions:", effectivePermissions);
  });

  useEffect(() => {
    if (canInvite) return;

    const timer = window.setTimeout(logCurrentPermissions, 0);
    return () => window.clearTimeout(timer);
  }, [canInvite]);

  async function loadRoster(targetPage: number) {
    if (!organizationId || !canRead) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/members?page=${targetPage}&size=${pageSize}`, {
        headers: { "X-Organization-Id": organizationId },
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));

      setRoster(workforceMemberPageSchema.parse(body));
      setPage(targetPage);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load the team.");
    } finally {
      setLoading(false);
    }
  }

  const loadInitialRoster = useEffectEvent(() => {
    void loadRoster(0);
  });

  useEffect(() => {
    if (!canRead || !organizationId) return;

    const timer = window.setTimeout(loadInitialRoster, 0);
    return () => window.clearTimeout(timer);
  }, [canRead, organizationId]);

  async function openRoleManager(member: WorkforceMemberResource) {
    if (!organizationId || !canAssignRoles || isOwner(member)) return;

    setSelectedMember(member);
    setSelectedRoleId("");
    setError(null);
    try {
      const response = await fetch("/api/workforce/roles", {
        headers: { "X-Organization-Id": organizationId },
      });
      const body: unknown = await response.json();
      if (!response.ok || !Array.isArray(body)) throw new Error(readErrorMessage(body));
      setRoles(body as WorkforceRoleResource[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load roles.");
    }
  }

  async function assignRole() {
    if (!organizationId || !selectedMember?.memberId || !selectedRoleId) return;

    setSavingRole(true);
    try {
      const response = await fetch(`/api/workforce/roles/members/${selectedMember.memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json()));

      setSelectedMember(null);
      await loadRoster(page);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to assign the role.");
    } finally {
      setSavingRole(false);
    }
  }

  async function confirmRemoveMember() {
    const member = memberToRemove;
    if (!organizationId || !member?.memberId || isOwner(member)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workforce/members/${member.memberId}`, {
        method: "DELETE",
        headers: { "X-Organization-Id": organizationId },
      });
      if (!response.ok) throw new Error(readErrorMessage(await response.json()));
      setMemberToRemove(null);
      await loadRoster(page);
    } catch (reason) {
      setMemberToRemove(null);
      setError(reason instanceof Error ? reason.message : "Unable to remove the member.");
    } finally {
      setLoading(false);
    }
  }

  const pendingInvitations = roster?.content.filter((member) => member.status === "PENDING") ?? [];

  if (!canRead || !organizationId) {
    return (
      <PageShell>
        <PageHeader title="Team" description="Manage the people who work in your organization." />
        <Card>
          <CardContent className="space-y-3 p-7 text-center">
            <ShieldAlert className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have permission to view this team.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Team"
        description="People, roles, and membership status for the active organization."
        actions={<InviteMemberButton onClick={() => setIsInviteDialogOpen(true)} />}
      />

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center justify-between gap-4 p-4 text-sm">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void loadRoster(page)} disabled={loading}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "members" | "pending")}
        className="w-full"
      >
        <TabsList
          variant="line"
          className="w-full flex-row justify-start gap-6 border-b border-border"
        >
          <TabsTrigger
            value="members"
            className="flex-none rounded-none border-b-2 border-transparent px-0 pt-2 pb-3 text-sm font-medium text-muted-foreground transition-colors after:hidden hover:text-foreground data-active:border-b-foreground data-active:text-foreground"
          >
            Members
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex-none rounded-none border-b-2 border-transparent px-0 pt-2 pb-3 text-sm font-medium text-muted-foreground transition-colors after:hidden hover:text-foreground data-active:border-b-foreground data-active:text-foreground"
          >
            Pending Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Roster</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {roster ? `${roster.totalElements} people in this organization` : "Loading team members..."}
                  </p>
                </div>
                {loading ? <span className="text-xs text-muted-foreground">Updating...</span> : null}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-5">Person</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="px-5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster?.content.map((member) => {
                    const owner = isOwner(member);
                    const canEditMember = member.memberId !== null && member.status === "ACTIVE" && !owner;
                    return (
                      <TableRow key={member.invitationId}>
                        <TableCell className="px-5 py-4 whitespace-normal">
                          <div className="font-medium text-foreground">{member.username ?? member.email}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{member.email}</div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap gap-1.5">
                            {owner ? <Badge variant="secondary">Owner</Badge> : null}
                            {member.roles.map((role) => <Badge key={role.id} variant="outline">{role.name}</Badge>)}
                            {!owner && member.roles.length === 0 ? <span className="text-sm text-muted-foreground">No role</span> : null}
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={member.status} /></TableCell>
                        <TableCell className="text-xs leading-5 whitespace-normal text-muted-foreground">
                          <div>Invited {formatDate(member.invitedAt)}</div>
                          {member.joinedAt ? <div>Joined {formatDate(member.joinedAt)}</div> : null}
                        </TableCell>
                        <TableCell className="px-5 text-right">
                          {owner ? <span className="text-xs text-muted-foreground">Protected</span> : null}
                          {!owner && canEditMember && (canAssignRoles || canManageMembers) ? (
                            <div className="flex justify-end gap-2">
                              {canAssignRoles ? (
                                <Button variant="outline" size="sm" onClick={() => void openRoleManager(member)}>
                                  <UserRoundCog className="size-4" aria-hidden="true" />
                                  Roles
                                </Button>
                              ) : null}
                              {canManageMembers ? (
                                <Button variant="destructive" size="sm" onClick={() => setMemberToRemove(member)}>
                                  Remove
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && roster?.content.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No members found.</TableCell></TableRow>
                  ) : null}
                </TableBody>
              </Table>

              {roster && roster.totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-5 py-4">
                  <span className="text-xs text-muted-foreground">Page {page + 1} of {roster.totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon-sm" disabled={loading || page === 0} onClick={() => void loadRoster(page - 1)} aria-label="Previous page">
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" disabled={loading || page >= roster.totalPages - 1} onClick={() => void loadRoster(page + 1)} aria-label="Next page">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <PendingInvitationsList invitations={pendingInvitations} />
        </TabsContent>
      </Tabs>

      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Assign role</DialogTitle>
            <DialogDescription>
              Add a role to {selectedMember?.username ?? selectedMember?.email}.
            </DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-sm font-medium">
            Available role
            <select className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm" value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)}>
              <option value="">Select a role</option>
              {roles.filter((role) => !selectedMember?.roles.some((assigned) => assigned.id === role.id)).map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>
          <DialogFooter>
            <Button type="button" onClick={() => void assignRole()} disabled={!selectedRoleId || savingRole}>
              {savingRole ? "Assigning..." : "Assign role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteMembersDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        organizationId={organizationId ?? null}
        establishmentId={establishmentId}
        onInvited={() => void loadRoster(0)}
      />

      <AlertDialog
        open={isRemoveConfirmOpen}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              {memberToRemove?.username ?? memberToRemove?.email} from this establishment? This action
              cannot be undone.
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
    </PageShell>
  );
}

function isOwner(member: WorkforceMemberResource): boolean {
  return member.isOwner || member.roles.some((role) => role.systemRole && role.name === "Owner");
}

function StatusBadge({ status }: { status: WorkforceMemberResource["status"] }) {
  const variant = status === "ACTIVE" ? "default" : status === "REMOVED" || status === "EXPIRED" ? "destructive" : "outline";
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
