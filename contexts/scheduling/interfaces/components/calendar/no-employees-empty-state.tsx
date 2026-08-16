import { UsersRound } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/contexts/shared/interfaces/components/ui/empty";

export function NoEmployeesEmptyState() {
  return (
    <Empty className="min-h-[400px] rounded-xl border-border/70 bg-muted/10 p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersRound aria-hidden="true" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>No team members yet</EmptyTitle>
          <EmptyDescription>
            Invite employees to your establishment to start scheduling appointments.
          </EmptyDescription>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
