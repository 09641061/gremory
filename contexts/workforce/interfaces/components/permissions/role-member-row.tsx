"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, User } from "lucide-react";

import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { removeWorkforceRoleAssignmentAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function RoleMemberRow({
  roleId,
  member,
  editable,
}: {
  roleId: string;
  member: TeamUserSummary;
  editable: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(removeWorkforceRoleAssignmentAction, {
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="flex items-center justify-between p-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-4" />
        </div>
        <span className="truncate text-sm text-foreground font-medium">{member.email}</span>
      </div>

      <form action={formAction} className="shrink-0">
        <input type="hidden" name="roleId" value={roleId} />
        <input type="hidden" name="memberId" value={member.memberId ?? ""} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={pending || !editable}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:hover:bg-transparent"
        >
          {pending ? <Spinner className="size-3" /> : <Trash2 className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
