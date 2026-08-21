"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Settings2, UserPlus, AlertCircle } from "lucide-react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Alert, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";
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
  currentUserId = null,
  currentUserIsOwner = false,
  canManageOwnAvailability = false,
  canManageOtherAvailability = false,
  canManageScheduling = false,
  availabilityError = null,
}: {
  establishmentId: string | null;
  members: TeamUserSummary[];
  canManageRoles: boolean;
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  canCancelInvitations?: boolean;
  currentUserId?: string | null;
  currentUserIsOwner?: boolean;
  canManageOwnAvailability?: boolean;
  canManageOtherAvailability?: boolean;
  canManageScheduling?: boolean;
  availabilityError?: string | null;
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

  const canEditAvailabilityFor = (member: TeamUserSummary) => {
    if (!member.userId) return false;
    const isSelf = member.userId === currentUserId;
    // The owner's availability can only be changed by the owner itself.
    if (member.isOwner) return currentUserIsOwner;
    // The owner can manage everyone's availability implicitly.
    if (currentUserIsOwner) return true;
    return isSelf ? canManageOwnAvailability : canManageOtherAvailability;
  };

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
            {availabilityError ? (
              <Alert variant="destructive" className="mb-4 rounded-none border-x-0 border-t-0">
                <AlertCircle className="size-4" />
                <AlertDescription>{availabilityError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(220px,1fr)_minmax(150px,.8fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] border-b border-border/70 bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                key={member.memberId ?? member.userId ?? member.invitationId ?? member.email}
                member={member}
                canRemoveMembers={canRemoveMembers}
                canCancelInvitations={canCancelInvitations}
                isOwner={member.isOwner || (currentUserIsOwner && member.userId !== null && member.userId === currentUserId)}
                canEditAvailability={canEditAvailabilityFor(member)}
                canEditVisibility={canManageScheduling}
              />
            ))}
            {filteredMembers.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">No members found.</div>}
          </div>
        </CardContent>
      </Card>

      {inviteOpen && establishmentId ? (
        <InviteMembersDialog establishmentId={establishmentId} onClose={() => setInviteOpen(false)} />
      ) : null}
    </PageShell>
  );
}
