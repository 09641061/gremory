"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, User, UserMinus, UserX } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
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
import { MemberRolesDropdown } from "./member-roles-dropdown";

const initialActionState = { status: "idle", data: null, error: null } as const;

export function MemberRow({
  member,
  canRemoveMembers = true,
  canCancelInvitations = true,
}: {
  member: TeamUserSummary;
  canRemoveMembers?: boolean;
  canCancelInvitations?: boolean;
}) {
  const [removeState, removeAction, removePending] = useActionState(removeTeamMemberAction, initialActionState);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeTeamInvitationAction, initialActionState);
  const router = useRouter();

  useEffect(() => {
    if ([removeState.status, revokeState.status].includes("success")) {
      router.refresh();
    }
  }, [removeState.status, revokeState.status, router]);

  const memberId = member.memberId;
  const canRemove = member.canRemoveMembership && memberId !== null && canRemoveMembers;
  const canCancel = member.canRevokeInvitation && canCancelInvitations;
  const error = removeState.error ?? revokeState.error;

  return (
    <div className="grid min-h-[96px] grid-cols-[minmax(320px,1.4fr)_minmax(150px,.55fr)_minmax(150px,.55fr)_minmax(170px,.7fr)] items-center border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-5" />
        </span>
        <span className="truncate text-[15px] text-foreground">{member.email}</span>
      </div>
      <div>
        <MemberRolesDropdown roles={member.roles} />
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
        <ErrorAlert title="Action failed" message={error ?? undefined} />
      </div>
    </div>
  );
}

function formatStatus(status: TeamUserSummary["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

