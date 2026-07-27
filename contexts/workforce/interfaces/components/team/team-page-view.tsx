"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Search, Settings2, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  removeTeamMemberAction,
  revokeTeamInvitationAction,
} from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { InviteMembersDialog } from "./invite-members-dialog";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

export function TeamPageView({ establishmentId, members }: { establishmentId: string | null; members: TeamUserSummary[] }) {
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
          <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/permissions")}>
            <Settings2 className="size-4" />
            Manage permissions
          </Button>
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
            <div className="grid grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground">
              <span>{members.length} {members.length === 1 ? "Member" : "Members"}</span>
              <span>Status</span>
              <div className="flex justify-end">
                <span className="min-w-[116px] text-left">Actions</span>
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
  const router = useRouter();
  useEffect(() => {
    if (removeState.status === "success" || revokeState.status === "success") router.refresh();
  }, [removeState.status, revokeState.status, router]);
  const memberId = member.memberId;
  const canRemove = member.canRemoveMembership && memberId !== null;
  const canCancel = member.canRevokeInvitation;
  const error = removeState.error ?? revokeState.error;
  return (
    <div className="grid min-h-[96px] grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] items-center border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-5" />
        </span>
        <span className="truncate text-[15px] text-foreground">{member.email}</span>
      </div>
      <span className="text-[15px] text-muted-foreground">{formatStatus(member.status)}</span>
      <div className="flex flex-col items-end gap-2">
        {canCancel ? (
          <form action={revokeAction}>
            <input type="hidden" name="invitationId" value={member.invitationId} />
            <Button type="submit" variant="outline" size="sm" disabled={revokePending} className="min-w-[116px]">
              {revokePending ? "Cancelling…" : "Cancel"}
            </Button>
          </form>
        ) : canRemove ? (
          <form action={removeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <Button type="submit" variant="outline" size="sm" disabled={removePending} className="min-w-[116px]">
              {removePending ? "Removing…" : "Remove"}
            </Button>
          </form>
        ) : null}
        {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}

function formatStatus(status: TeamUserSummary["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
