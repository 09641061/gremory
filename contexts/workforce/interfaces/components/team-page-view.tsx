"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { BookOpen, Search, User, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { inviteTeamUserAction, removeTeamMemberAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

export function TeamPageView({ establishmentId, members }: { establishmentId: string | null; members: TeamUserSummary[] }) {
  const [filter, setFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const filteredMembers = useMemo(() => members.filter((member) => member.email.toLowerCase().includes(filter.toLowerCase())), [filter, members]);

  return (
    <section className="mx-auto w-full max-w-[1540px] py-1">
      <div className="mb-11 flex items-center justify-between gap-4">
        <h1 className="page-title">Team</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden h-9 gap-2 sm:inline-flex"><BookOpen className="size-4" />Docs</Button>
          <Button className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => setInviteOpen(true)} disabled={!establishmentId}><UserPlus className="size-4" />Invite members</Button>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-[292px]"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter members" aria-label="Filter members" className="h-9 pl-9" /></label>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"><span>Member</span><span>Role</span><span /></div>
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
  const [state, formAction, pending] = useActionState(removeTeamMemberAction, initialActionState);
  const router = useRouter();
  useEffect(() => { if (state.status === "success") router.refresh(); }, [router, state.status]);
  const memberId = member.memberId;
  const canRemove = member.canRemoveMembership && memberId !== null;
  return (
    <div className="grid min-h-[96px] grid-cols-[minmax(420px,1.7fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] items-center border-b border-border px-5 py-4">
      <div className="flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground"><User className="size-5" /></span><span className="truncate text-[15px] text-foreground">{member.email}</span></div>
      <span className="text-[15px] text-muted-foreground">{member.role ?? "Member"}</span>
      <form action={formAction} className="flex justify-end">{canRemove ? <input type="hidden" name="memberId" value={memberId} /> : null}<Button type="submit" variant="outline" size="sm" disabled={!canRemove || pending} className="h-9 min-w-[116px] text-muted-foreground">{pending ? "Removing…" : "Remove"}</Button></form>
    </div>
  );
}

function InviteMembersDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(inviteTeamUserAction, initialActionState);
  useEffect(() => { if (state.status === "success") onClose(); }, [onClose, state.status]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between"><div><h2 id="invite-title" className="text-lg font-semibold">Invite members</h2><p className="mt-1 text-sm text-muted-foreground">Send an invitation by email.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button></div>
        <form action={formAction} className="space-y-4"><input type="hidden" name="establishmentId" value={establishmentId} /><label className="block text-sm font-medium">Email<input name="email" type="email" required placeholder="name@company.com" className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /></label>{state.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}<div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send invite"}</Button></div></form>
      </div>
    </div>
  );
}
