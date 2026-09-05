"use client";

import { ChevronDown, User } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

interface RoleSummary {
  id: string;
  name: string;
}

interface MemberRolesDropdownProps {
  roles: ReadonlyArray<RoleSummary>;
}

export function MemberRolesDropdown({ roles }: MemberRolesDropdownProps) {
  const { t } = useWorkforceTranslations();

  if (roles.length === 0) {
    return (
      <span className="inline-flex rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground">
        {t.team.noRole}
      </span>
    );
  }

  const count = roles.length;
  const label = count === 1 ? t.team.roleCountSingle : t.team.roleCountPlural.replace("{count}", String(count));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 rounded-full bg-muted/30 text-foreground border-border hover:bg-muted/60 transition-colors"
          />
        }
      >
        <span>{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-1">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            className="flex items-center gap-2 px-2.5 py-2 text-sm text-foreground focus:bg-muted/50 cursor-default"
          >
            <User className="size-3.5 text-muted-foreground/70" />
            <span className="truncate">{role.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

