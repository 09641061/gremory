import { AccessDeniedActions } from "@/contexts/shared/interfaces/components/access-denied-actions";
import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-lg">
        <Card>
          <CardContent className="space-y-4 p-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              You do not have permission to access this section
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Your user belongs to an organization and establishment, but your role does not have permission to use this module.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Ask the organization administrator to assign you the required permissions.
            </p>
            <AccessDeniedActions />
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}
