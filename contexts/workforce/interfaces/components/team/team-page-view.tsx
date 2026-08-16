"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Settings2, UserPlus, UsersRound } from "lucide-react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/contexts/shared/interfaces/components/ui/empty";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
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

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        [member.name, member.email].some((value) =>
          value?.toLowerCase().includes(filter.toLowerCase()),
        ),
      ),
    [filter, members],
  );

  return (
    <PageShell>
      <PageHeader
        title="Team"
        description="Manage team members and pending invitations."
        actions={
          <>
            {canManageRoles ? (
              <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/permissions")}>
                <Settings2 className="size-4" />
                Manage permissions
              </Button>
            ) : null}
            {canInviteMembers ? (
              <Button className="gap-2" onClick={() => setInviteOpen(true)} disabled={!establishmentId}>
                <UserPlus className="size-4" />
                Invite members
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter members"
            aria-label="Filter members"
            className="pl-9"
          />
        </label>
        <span className="shrink-0 text-sm text-muted-foreground">
          {filter.trim()
            ? `${filteredMembers.length} of ${members.length} ${members.length === 1 ? "member" : "members"}`
            : `${members.length} ${members.length === 1 ? "member" : "members"}`}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(220px,1fr)_minmax(150px,.8fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border/70 bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <div className="flex justify-end">
                <span className="min-w-[116px] text-left" aria-hidden="true" />
              </div>
            </div>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MemberRow
                  key={member.memberId ?? member.invitationId}
                  member={member}
                  canRemoveMembers={canRemoveMembers}
                  canCancelInvitations={canCancelInvitations}
                />
              ))
            ) : (
              <Empty className="rounded-none border-0 py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UsersRound aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>No team members found</EmptyTitle>
                    <EmptyDescription>
                      Invite a team member to start managing appointments and access.
                    </EmptyDescription>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </CardContent>
      </Card>

      {inviteOpen && establishmentId ? (
        <InviteMembersDialog establishmentId={establishmentId} onClose={() => setInviteOpen(false)} />
      ) : null}
    </PageShell>
  );
}
