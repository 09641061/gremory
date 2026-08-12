"use client";

import { useMemo, useState } from "react";
import { Search, Settings2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { InviteMembersDialog } from "./invite-members-dialog";
import { MemberRow } from "./member-row";


export function TeamPageView({
  establishmentId,
  members,
  canManageRoles,
  canInviteMembers = true,
  canRemoveMembers = true,
  canCancelInvitations = true,
}: {
  establishmentId: string | null;
  members: TeamUserSummary[];
  canManageRoles: boolean;
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  canCancelInvitations?: boolean;
}) {

  const [filter, setFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const router = useRouter();
  const filteredMembers = useMemo(() => members.filter((member) =>
    [member.name, member.email].some((value) => value?.toLowerCase().includes(filter.toLowerCase()))
  ), [filter, members]);

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
          {canInviteMembers && (
            <Button className="gap-2" onClick={() => setInviteOpen(true)} disabled={!establishmentId}>
              <UserPlus className="size-4" />
              Invite members
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter members" aria-label="Filter members" className="pl-9" />
        </label>
        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          {members.length} {members.length === 1 ? "Member" : "Members"}
        </span>
      </div>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(220px,1fr)_minmax(150px,.8fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <div className="flex justify-end">
                <span className="min-w-[116px] text-left" aria-hidden="true" />
              </div>
            </div>
            {filteredMembers.map((member) => (
              <MemberRow
                key={member.memberId ?? member.invitationId}
                member={member}
                canRemoveMembers={canRemoveMembers}
                canCancelInvitations={canCancelInvitations}
              />
            ))}
            {filteredMembers.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">No members found.</div>}
          </div>
        </CardContent>
      </Card>
      {inviteOpen && establishmentId && <InviteMembersDialog establishmentId={establishmentId} onClose={() => setInviteOpen(false)} />}
    </section>
  );
}
