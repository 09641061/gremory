"use client";

import { useActionState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { inviteTeamUserAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

export function InviteMembersDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const { t } = useWorkforceTranslations();
  const [state, formAction, pending] = useActionState(inviteTeamUserAction, initialActionState);
  useEffect(() => { if (state.status === "success") onClose(); }, [onClose, state.status]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t.inviteModal.title}</DialogTitle>
            <DialogDescription>
              {t.inviteModal.description}
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="establishmentId" value={establishmentId} />
          
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium text-foreground">
              {t.inviteModal.emailLabel}
            </label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder={t.inviteModal.emailPlaceholder}
              autoFocus
            />
          </div>

          <ErrorAlert
            title={t.inviteModal.inviteFailed}
            message={state.status === "error" ? state.error : undefined}
          />

          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>{t.inviteModal.cancel}</Button>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? <Spinner className="size-4" /> : <UserPlus className="size-4" />}
              {pending ? t.inviteModal.sending : t.inviteModal.sendInvite}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
