"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/contexts/shared/interfaces/components/ui/select";
import { assignWorkforceInvitationRoleAction, assignWorkforceMemberRoleAction } from "../actions/workforce.actions";

export function RoleAssignmentSelect({ organizationId, targetId, target, currentRoleId, roles }: {
  organizationId: string;
  targetId: string;
  target: "member" | "invitation";
  currentRoleId: string | null;
  roles: readonly { id: string; name: string }[];
}) {
  const [value, setValue] = useState<string | null>(currentRoleId);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const items = roles.map((role) => ({ value: role.id, label: role.name }));

  return <div className="flex flex-col gap-1">
    <Select value={value} items={items} disabled={pending || roles.length === 0} onValueChange={(next) => {
      if (typeof next !== "string" || next === value) return;
      const previous = value;
      setValue(next);
      startTransition(async () => {
        const result = target === "member"
          ? await assignWorkforceMemberRoleAction(organizationId, targetId, next)
          : await assignWorkforceInvitationRoleAction(organizationId, targetId, next);
        if (!result.success) { setValue(previous); setMessage(result.error); }
        else setMessage("Rol actualizado.");
      });
    }}>
      <SelectTrigger className="min-w-40"><SelectValue placeholder="Sin rol" /></SelectTrigger>
      <SelectContent><SelectGroup>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectGroup></SelectContent>
    </Select>
    {message && <span className="sr-only" role="status">{message}</span>}
  </div>;
}
