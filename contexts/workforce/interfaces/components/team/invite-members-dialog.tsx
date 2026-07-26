"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { inviteTeamUserAction } from "@/contexts/workforce/interfaces/actions/team.actions";
import type { TeamActionResult } from "@/contexts/workforce/interfaces/actions/team-action-result";

const initialActionState: TeamActionResult = { status: "idle", data: null, error: null };

export function InviteMembersDialog({ establishmentId, onClose }: { establishmentId: string; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(inviteTeamUserAction, initialActionState);
  useEffect(() => { if (state.status === "success") onClose(); }, [onClose, state.status]);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div><h2 id="invite-title" className="text-lg font-semibold">Invite team members</h2><p className="mt-1 text-sm text-muted-foreground">Send invitations and choose the access each new team member receives.</p></div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="establishmentId" value={establishmentId} />
          <label className="block text-sm font-medium">Email<input name="email" type="email" required placeholder="name@company.com" className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /></label>
          {state.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send invite"}</Button></div>
        </form>
      </div>
    </div>
  );
}
