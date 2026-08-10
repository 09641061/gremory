"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UserMinus, UserX } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import {
  removeTeamMemberAction,
  revokeTeamInvitationAction,
} from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { MemberRolesDropdown } from "./member-roles-dropdown";

const initialActionState = { status: "idle", data: null, error: null } as const;

/** Dispatches a Server Action that expects a single form field, without a <form> wrapper. */
function submitField(
  action: (formData: FormData) => void,
  name: string,
  value: string,
) {
  const formData = new FormData();
  formData.append(name, value);
  startTransition(() => action(formData));
}

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
  const [confirming, setConfirming] = useState<"remove" | "revoke" | null>(null);

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
        <EntityActionsMenu
          label={`Member actions for ${member.email}`}
          size="icon-sm"
          actions={[
            {
              label: revokePending ? "Cancelling..." : "Cancel invite",
              icon: UserX,
              variant: "destructive",
              hidden: !canCancel,
              disabled: revokePending,
              onSelect: () => setConfirming("revoke"),
            },
            {
              label: removePending ? "Removing..." : "Remove member",
              icon: UserMinus,
              variant: "destructive",
              hidden: !canRemove,
              disabled: removePending,
              onSelect: () => setConfirming("remove"),
            },
          ]}
        />
        {error && confirming === null ? (
          <ErrorAlert title="Action failed" message={error} />
        ) : null}

        <DeleteConfirmDialog
          open={confirming === "remove" && removeState.status !== "success"}
          onOpenChange={(open) => {
            if (!open) setConfirming(null);
          }}
          entityLabel="member"
          entityName={member.email}
          confirmLabel="Remove"
          pendingLabel="Removing..."
          pending={removePending}
          error={removeState.error}
          description={
            <>
              <span className="font-medium text-foreground">{member.email}</span> will lose access to this
              workspace.
            </>
          }
          onConfirm={() => submitField(removeAction, "memberId", memberId ?? "")}
        />

        <DeleteConfirmDialog
          open={confirming === "revoke" && revokeState.status !== "success"}
          onOpenChange={(open) => {
            if (!open) setConfirming(null);
          }}
          entityLabel="invitation"
          entityName={member.email}
          confirmLabel="Cancel"
          pendingLabel="Cancelling..."
          pending={revokePending}
          error={revokeState.error}
          description={
            <>
              The invitation sent to{" "}
              <span className="font-medium text-foreground">{member.email}</span> will no longer be valid.
            </>
          }
          onConfirm={() => submitField(revokeAction, "invitationId", member.invitationId)}
        />
      </div>
    </div>
  );
}

function formatStatus(status: TeamUserSummary["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

