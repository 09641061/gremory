"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Search, Settings2, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
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
    <section className="mx-auto w-full max-w-[1540px] py-1">
      <div className="mb-11 flex items-center justify-between gap-4">
        <h1 className="page-title">Team</h1>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" className="h-9 gap-2" onClick={() => router.push("/permissions")}><Settings2 className="size-4" />Manage permissions</Button>
          <Button className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => setInviteOpen(true)} disabled={!establishmentId}><UserPlus className="size-4" />Invite members</Button>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-[292px]"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter members" aria-label="Filter members" className="h-9 pl-9" /></label>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground"><span>Member</span><span>Status</span><span /></div>
          {filteredMembers.map((member) => <MemberRow key={member.memberId ?? member.invitationId} member={member} />)}
          {filteredMembers.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">No members found.</div>}
          <div className="border-t border-border px-5 py-5 text-sm text-muted-foreground">{members.length} {members.length === 1 ? "member" : "members"}</div>
        </div>
      </div>
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
    <div className="grid min-h-[96px] grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] items-center border-b border-border px-5 py-4">
      <div className="flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground"><User className="size-5" /></span><span className="truncate text-[15px] text-foreground">{member.email}</span></div>
      <span className="text-[15px] text-muted-foreground">{formatStatus(member.status)}</span>
      <div className="flex flex-col items-end gap-2">
        {canCancel ? (
          <form action={revokeAction}>
            <input type="hidden" name="invitationId" value={member.invitationId} />
            <Button type="submit" variant="outline" size="sm" disabled={revokePending} className="h-9 min-w-[116px] text-muted-foreground">{revokePending ? "Cancelling…" : "Cancel"}</Button>
          </form>
        ) : canRemove ? (
          <form action={removeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <Button type="submit" variant="outline" size="sm" disabled={removePending} className="h-9 min-w-[116px] text-muted-foreground">{removePending ? "Removing…" : "Remove"}</Button>
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
