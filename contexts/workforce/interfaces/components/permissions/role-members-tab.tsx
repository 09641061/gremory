"use client";

import { Plus, Search, User } from "lucide-react";
import { useMemo, useState } from "react";

import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";
import { AddMembersDialog } from "./add-members-dialog";
import { RoleMemberRow } from "./role-member-row";

interface RoleMembersTabProps {
  role: WorkforceRoleSummary;
  members: ReadonlyArray<TeamUserSummary>;
  editable: boolean;
}

export function RoleMembersTab({ role, members, editable }: RoleMembersTabProps) {
  const { t } = useWorkforceTranslations();
  const [memberFilter, setMemberFilter] = useState("");
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  const roleMembers = useMemo(() => {
    return members.filter((member) => member.roles.some((r) => r.id === role.id));
  }, [members, role]);

  const availableMembers = useMemo(() => {
    return members.filter((member) => !member.isOwner && !member.roles.some((r) => r.id === role.id));
  }, [members, role]);

  const filteredRoleMembers = useMemo(() => {
    const normalized = memberFilter.trim().toLowerCase();
    if (!normalized) return roleMembers;
    return roleMembers.filter((m) => m.email.toLowerCase().includes(normalized));
  }, [memberFilter, roleMembers]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <label className="relative block w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
              placeholder={t.roleDialogs.addMembersSearchPlaceholder}
              aria-label={t.roleDialogs.addMembersSearchPlaceholder}
              className="pl-9"
            />
          </label>
          <Button
            type="button"
            onClick={() => setAddMembersOpen(true)}
            disabled={!editable}
            className="shrink-0 gap-2 sm:whitespace-nowrap"
          >
            <Plus className="size-4" />
            {t.permissions.addMembers}
          </Button>
        </div>

        {filteredRoleMembers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <User className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">{t.permissions.emptyMembersTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.permissions.emptyMembersDescription}</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            {filteredRoleMembers.map((member) => (
              <RoleMemberRow key={member.memberId} roleId={role.id!} member={member} editable={editable} />
            ))}
          </div>
        )}
      </div>

      {addMembersOpen && role.id && (
        <AddMembersDialog
          roleId={role.id}
          availableMembers={availableMembers}
          onClose={() => setAddMembersOpen(false)}
        />
      )}
    </>
  );
}
