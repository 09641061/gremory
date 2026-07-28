"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { MoreVertical, Search, Settings2, User, UserMinus, UserPlus, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import {
  removeTeamMemberAction,
  revokeTeamInvitationAction,
} from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { InviteMembersDialog } from "./invite-members-dialog";
import { removeWorkforceRoleAssignmentAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

type RoleOption = { id: string; name: string; position: number; systemRole: boolean };

export function TeamPageView({ establishmentId, members, roles: _roles, canManageRoles }: { establishmentId: string | null; members: TeamUserSummary[]; roles: RoleOption[]; canManageRoles: boolean }) {
  const [filter, setFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const router = useRouter();
  const filteredMembers = useMemo(() => members.filter((member) => member.email.toLowerCase().includes(filter.toLowerCase())), [filter, members]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-description mt-2">Manage team members and pending invitations.</p>
        </div>
        <div className="flex items-center gap-3">
          {canManageRoles ? <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/permissions")}>
            <Settings2 className="size-4" />
            Manage permissions
          </Button> : null}
          <Button className="gap-2" onClick={() => setInviteOpen(true)} disabled={!establishmentId}>
            <UserPlus className="size-4" />
            Invite members
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter members" aria-label="Filter members" className="pl-9" />
        </label>
      </div>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[minmax(320px,1.4fr)_minmax(150px,.55fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground">
              <span>{members.length} {members.length === 1 ? "Member" : "Members"}</span>
              <span>Role</span>
              <span>Status</span>
              <div className="flex justify-end">
                <span className="min-w-[116px] text-left" aria-hidden="true" />
              </div>
            </div>
            {filteredMembers.map((member) => <MemberRow key={member.memberId ?? member.invitationId} member={member} />)}
            {filteredMembers.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">No members found.</div>}
          </div>
        </CardContent>
      </Card>
      {inviteOpen && establishmentId && <InviteMembersDialog establishmentId={establishmentId} onClose={() => setInviteOpen(false)} />}
    </section>
  );
}

function MemberRow({ member }: { member: TeamUserSummary }) {
  const [removeState, removeAction, removePending] = useActionState(removeTeamMemberAction, initialActionState);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeTeamInvitationAction, initialActionState);
  const [removeRoleState, removeRoleAction, removeRolePending] = useActionState(removeWorkforceRoleAssignmentAction, { status: "idle", data: null, error: null } as const);
  const router = useRouter();
  useEffect(() => {
    if ([removeState.status, revokeState.status, removeRoleState.status].includes("success")) router.refresh();
  }, [removeState.status, revokeState.status, removeRoleState.status, router]);
  const memberId = member.memberId;
  const canRemove = member.canRemoveMembership && memberId !== null;
  const canCancel = member.canRevokeInvitation;
  const error = removeState.error ?? revokeState.error ?? removeRoleState.error;
  return (
    <div className="grid min-h-[96px] grid-cols-[minmax(320px,1.4fr)_minmax(150px,.55fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] items-center border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-5" />
        </span>
        <span className="truncate text-[15px] text-foreground">{member.email}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {member.roles.map((role) => (
          <form key={role.id} action={removeRoleAction} className="inline-flex items-center">
            <input type="hidden" name="memberId" value={member.memberId ?? ""} />
            <input type="hidden" name="roleId" value={role.id} />
            <button type="submit" disabled={role.systemRole || removeRolePending} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground disabled:cursor-default disabled:opacity-70" title={role.systemRole ? "Everyone is inherited and protected" : "Remove role"}>
              {role.name}{role.systemRole ? "" : " ×"}
            </button>
          </form>
        ))}
      </div>
      <span className="text-[15px] text-muted-foreground">{formatStatus(member.status)}</span>
      <div className="flex flex-col items-end gap-2">
        {canCancel || canRemove ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open member actions"
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canCancel ? (
                <form action={revokeAction}>
                  <input type="hidden" name="invitationId" value={member.invitationId} />
                  <DropdownMenuItem
                    nativeButton
                    render={<button type="submit" className="w-full" />}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    disabled={revokePending}
                  >
                    <UserX className="size-4" />
                    {revokePending ? "Cancelling..." : "Cancel invite"}
                  </DropdownMenuItem>
                </form>
              ) : null}
              {canRemove ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={memberId ?? ""} />
                  <DropdownMenuItem
                    nativeButton
                    render={<button type="submit" className="w-full" />}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    disabled={removePending}
                  >
                    <UserMinus className="size-4" />
                    {removePending ? "Removing..." : "Remove member"}
                  </DropdownMenuItem>
                </form>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <ErrorAlert
          title="Action failed"
          message={error ?? undefined}
        />
      </div>
    </div>
  );
}

function formatStatus(status: TeamUserSummary["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
