import { redirect } from "next/navigation";
import Link from "next/link";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";

export default async function EstablishmentSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}) {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(await searchParams);

  if (workspace.accountType === "PENDING_INVITATION") {
    redirect("/invitations/pending");
  }

  const organizationEstablishments = workspace.organization
    ? workspace.establishments.filter(
        (establishment) => establishment.organizationId === workspace.organization?.id,
      )
    : [];

  if (!workspace.organization || organizationEstablishments.length > 0) {
    redirect("/organizations");
  }

  return (
    <div className="flex min-h-[60svh] flex-1 items-center justify-center px-6 text-foreground">
      <section className="max-w-xl space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Set up your first establishment</h1>
          <p className="text-muted-foreground">
            {workspace.organization.name} is ready, but it still does not have any establishments.
          </p>
          <p className="text-muted-foreground">
            Create one location to start using the app and invite your team.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link
            href={`/establishments/new?organizationId=${encodeURIComponent(workspace.organization.id)}`}
            className={buttonVariants({ variant: "default" })}
          >
            Create establishment
          </Link>
          <Link href="/organizations" className={buttonVariants({ variant: "outline" })}>
            Manage organizations
          </Link>
        </div>
      </section>
    </div>
  );
}
