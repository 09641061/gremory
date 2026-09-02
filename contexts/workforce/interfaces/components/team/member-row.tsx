"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UserMinus, UserX } from "lucide-react";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import {
  removeTeamMemberAction,
  revokeTeamInvitationAction,
} from "@/contexts/workforce/interfaces/actions/team.actions";
import { updateEmployeeVisibilityAction } from "@/contexts/scheduling/interfaces/actions/update-employee-visibility.action";
import type { UpdateEmployeeVisibilityState } from "@/contexts/scheduling/interfaces/actions/update-employee-visibility.action";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { MemberRolesDropdown } from "./member-roles-dropdown";

const initialActionState = { status: "idle", data: null, error: null } as const;
const initialVisibilityState: UpdateEmployeeVisibilityState = { status: "idle", error: "" };

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
  isOwner: ownerFromWorkspace = false,
  canEditVisibility = false,
}: {
  member: TeamUserSummary;
  canRemoveMembers?: boolean;
  canCancelInvitations?: boolean;
  isOwner?: boolean;
  canEditAvailability?: boolean;
  canEditVisibility?: boolean;
}) {
  const [removeState, removeAction, removePending] = useActionState(removeTeamMemberAction, initialActionState);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeTeamInvitationAction, initialActionState);
  const [visibilityState, visibilityAction, visibilityPending] = useActionState(
    updateEmployeeVisibilityAction,
    initialVisibilityState,
  );
  const router = useRouter();
  const [confirming, setConfirming] = useState<"remove" | "revoke" | null>(null);

  useEffect(() => {
    if ([removeState.status, revokeState.status].includes("success")) {
      router.refresh();
    }
  }, [removeState.status, revokeState.status, router]);

  const wasSchedulingPending = useRef(false);
  useEffect(() => {
    const schedulingPending = visibilityPending;
    if (wasSchedulingPending.current && !schedulingPending) {
      router.refresh();
    }
    wasSchedulingPending.current = schedulingPending;
  }, [visibilityPending, router]);

  const memberId = member.memberId;
  const canRemove = member.canRemoveMembership && memberId !== null && canRemoveMembers;
  const canCancel = member.canRevokeInvitation && canCancelInvitations;
  const error = removeState.error ?? revokeState.error ?? visibilityState.error;
  const isOwner = ownerFromWorkspace || member.isOwner === true;

  return (
    <div className="grid min-h-[92px] grid-cols-[minmax(300px,1.4fr)_minmax(220px,1fr)_minmax(150px,.8fr)_minmax(120px,.55fr)_minmax(260px,1fr)_minmax(90px,.3fr)] items-center border-b border-border/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/20">
      <div className="flex items-center gap-4">
        <Avatar className="size-11 shrink-0 border border-border/70">
          <AvatarImage src={member.imageUrl ?? undefined} alt={member.name ?? member.email} />
          <AvatarFallback className="bg-muted/40 text-muted-foreground">
            <User className="size-5 text-muted-foreground" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[15px] text-foreground">{member.name ?? "—"}</span>
          </div>
        </div>
      </div>
      <span className="truncate text-sm text-muted-foreground">{member.email}</span>
      <div>
        {isOwner ? (
          <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            OWNER
          </span>
        ) : (
          <MemberRolesDropdown roles={member.roles} />
        )}
      </div>
      <div>
        <span className={statusBadgeClass(member.status)}>{formatStatus(member.status)}</span>
      </div>
      <div className="flex flex-col gap-1.5 justify-center">
        {member.userId && member.establishmentId && member.status === "ACTIVE" ? (
          isOwner ? (
            (() => {
              const userId = member.userId;
              const establishmentId = member.establishmentId;
              return (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={member.visibleForScheduling !== false}
                    disabled={!canEditVisibility || visibilityPending}
                    onCheckedChange={(visible) => {
                      if (visible === (member.visibleForScheduling !== false)) return;
                      const formData = new FormData();
                      formData.append("userId", userId);
                      formData.append("establishmentId", establishmentId);
                      formData.append("visible", String(visible));
                      startTransition(() => visibilityAction(formData));
                    }}
                    size="sm"
                  />
                  {member.visibleForScheduling !== false ? "Visible on schedule" : "Hidden from schedule"}
                </label>
              );
            })()
          ) : (
            <span className="text-xs text-muted-foreground">
              {member.visibleForScheduling !== false ? "Visible on schedule" : "Hidden from schedule"}
            </span>
          )
        ) : null}
        {!member.userId || member.status !== "ACTIVE" ? (
          <span className="text-xs text-muted-foreground">Not configurable</span>
        ) : null}
      </div>
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
          onConfirm={() => {
            if (!memberId) return;
            submitField(removeAction, "memberId", memberId);
          }}
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
          onConfirm={() => {
            if (!member.invitationId) return;
            submitField(revokeAction, "invitationId", member.invitationId);
          }}
        />
      </div>
    </div>
  );
}

function formatStatus(status: TeamUserSummary["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusBadgeClass(status: TeamUserSummary["status"]): string {
  const tone = status === "ACTIVE"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    : status === "PENDING"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-700"
      : "border-slate-500/20 bg-slate-500/10 text-slate-700";
  return `inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`;
}

