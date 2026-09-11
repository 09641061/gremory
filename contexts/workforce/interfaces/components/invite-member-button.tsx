"use client";

import { UserPlus } from "lucide-react";

import { usePermissions } from "@/contexts/workforce/interfaces/hooks/usePermissions";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

export function InviteMemberButton({ onClick }: { onClick: () => void }) {
  const { hasPermission } = usePermissions();

  if (!hasPermission("workforce:invite")) {
    return null;
  }

  return (
    <Button type="button" className="gap-2" onClick={onClick}>
      <UserPlus className="size-4" aria-hidden="true" />
      Invite member
    </Button>
  );
}
