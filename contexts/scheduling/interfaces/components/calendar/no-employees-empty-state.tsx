import { UsersIcon } from "lucide-react";

export function NoEmployeesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px] bg-muted/10 rounded-xl border border-dashed">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <UsersIcon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2 text-foreground">
        No team members yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Invite employees to your establishment to start scheduling appointments.
      </p>
    </div>
  );
}
