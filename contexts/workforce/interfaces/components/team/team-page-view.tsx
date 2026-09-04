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
import { useWorkforceTranslations } from "../../i18n";

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
  availabilityError?: string | null;
}) {
  const { t } = useWorkforceTranslations();
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

  const memberLabel = members.length === 1 ? t.team.memberSingle : t.team.memberPlural;

  return (
    <PageShell>
      <PageHeader
        title={t.team.title}
        description={t.team.description}
        actions={
          <>
            {canManageRoles ? (
              <Button type="button" variant="outline" className="gap-2" onClick={() => router.push("/permissions")}>
                <Settings2 className="size-4" />
                {t.team.managePermissions}
              </Button>
            ) : null}
            {canInviteMembers ? (
              <Button className="gap-2" onClick={() => setInviteOpen(true)} disabled={!establishmentId}>
                <UserPlus className="size-4" />
                {t.team.inviteMembers}
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
            placeholder={t.team.filterPlaceholder}
            aria-label={t.team.filterLabel}
            className="pl-9"
          />
        </label>
        <span className="shrink-0 text-sm text-muted-foreground">
          {filter.trim()
            ? t.team.membersCount
                .replace("{count}", String(filteredMembers.length))
                .replace("{total}", String(members.length))
                .replace("{label}", memberLabel)
            : t.team.totalMembers
                .replace("{total}", String(members.length))
                .replace("{label}", memberLabel)}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="min-w-[1180px]">
            {availabilityError ? (
              <Alert variant="destructive" className="mb-4 rounded-none border-x-0 border-t-0">
                <AlertCircle className="size-4" />
                <AlertDescription>{availabilityError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(220px,1fr)_minmax(150px,.8fr)_minmax(120px,.55fr)_minmax(260px,1fr)_minmax(90px,.3fr)] border-b border-border/70 bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>{t.team.tableHeaders.name}</span>
              <span>{t.team.tableHeaders.email}</span>
              <span>{t.team.tableHeaders.role}</span>
              <span>{t.team.tableHeaders.status}</span>
              <span>{t.team.tableHeaders.scheduling}</span>
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
                canEditVisibility={canEditAvailabilityFor(member)}
              />
            ))}
            {filteredMembers.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">{t.team.noMembersFound}</div>}
          </div>
        </CardContent>
      </Card>

      {inviteOpen && establishmentId ? (
        <InviteMembersDialog establishmentId={establishmentId} onClose={() => setInviteOpen(false)} />
      ) : null}
    </PageShell>
  );
}
