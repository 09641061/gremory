import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { getBusinessDictionary } from "@/contexts/business/interfaces/i18n";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { interpolate } from "@/contexts/shared/interfaces/i18n";

interface EstablishmentSetupPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default function EstablishmentSetupPage({ searchParams }: EstablishmentSetupPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EstablishmentSetupPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function EstablishmentSetupPageContent({ searchParams }: EstablishmentSetupPageProps) {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel(await searchParams);

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

  const serverLocale = await getServerLocale();
  const dictionary = getBusinessDictionary(serverLocale);

  return (
    <div className="flex min-h-[60svh] flex-1 items-center justify-center px-6 text-foreground">
      <section className="max-w-xl space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">{dictionary.establishments.setupTitle}</h1>
          <p className="text-muted-foreground">
            {interpolate(dictionary.establishments.setupReadyDesc, {
              name: workspace.organization.name,
            })}
          </p>
          <p className="text-muted-foreground">
            {dictionary.establishments.setupCreateDesc}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link
            href={`/establishments/new?organizationId=${encodeURIComponent(workspace.organization.id)}`}
            className={buttonVariants({ variant: "default" })}
          >
            {dictionary.establishments.setupCreateBtn}
          </Link>
          <Link href="/organizations" className={buttonVariants({ variant: "outline" })}>
            {dictionary.establishments.setupManageOrgsBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}
