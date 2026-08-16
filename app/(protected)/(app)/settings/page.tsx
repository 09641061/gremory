import { LogoutButton } from "@/contexts/iam/interfaces/components/logout-button";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage your session and account access."
      />

      <Card className="max-w-md">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">Session</h2>
            <p className="text-sm text-muted-foreground">Use this to sign out of the current workspace.</p>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </PageShell>
  );
}
