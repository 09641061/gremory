"use client";

import { Mail } from "lucide-react";

import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import type { WorkforceMemberResource } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

export function PendingInvitationsList({
  invitations,
}: {
  invitations: WorkforceMemberResource[];
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {invitations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No pending invitations.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {invitations.map((invitation) => (
              <li
                key={invitation.invitationId}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
              >
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                  {invitation.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  Sent {formatDate(invitation.invitedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
