"use client";

import { useState } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { createWorkforceInvitationSchema } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

export function InviteMembersDialog({
  isOpen,
  onClose,
  organizationId,
  establishmentId,
  onInvited,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string | null;
  establishmentId: string | null;
  onInvited?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeDialog() {
    setEmail("");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = { establishmentId: establishmentId ?? "", email };
    console.log("Form data submitted:", data);

    const parsed = createWorkforceInvitationSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Zod validation failed:", parsed.error.flatten().fieldErrors);
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    if (!organizationId) {
      console.error("Zod validation failed: missing organizationId");
      setError("The active organization could not be resolved.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/workforce/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json().catch(() => undefined);
      if (!response.ok) throw new Error(readErrorMessage(body));

      console.log("Invitation created:", body);
      onInvited?.();
      closeDialog();
    } catch (reason) {
      console.error("Failed to create invitation:", reason);
      setError(reason instanceof Error ? reason.message : "Unable to send the invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite to this team.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium" htmlFor="invite-member-email">
            Email address
            <Input
              id="invite-member-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              autoFocus
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to send the invitation.";
}
