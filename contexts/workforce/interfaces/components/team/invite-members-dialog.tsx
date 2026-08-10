"use client";

import { useActionState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { inviteTeamUserAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

export function InviteMembersDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(inviteTeamUserAction, initialActionState);
  useEffect(() => { if (state.status === "success") onClose(); }, [onClose, state.status]);

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Invite team members</AlertDialogTitle>
            <AlertDialogDescription>
              Send invitations and choose the access each new team member receives.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <input type="hidden" name="establishmentId" value={establishmentId} />
          
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="name@company.com"
              autoFocus
            />
          </div>

          <ErrorAlert
            title="Invite failed"
            message={state.status === "error" ? state.error : undefined}
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending} onClick={onClose}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <UserPlus className="size-4" />}
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
