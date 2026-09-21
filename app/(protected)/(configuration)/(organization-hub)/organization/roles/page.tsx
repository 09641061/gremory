import { Suspense } from "react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";

export default function OrganizationRolesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrganizationRolesPageContent />
    </Suspense>
  );
}

async function OrganizationRolesPageContent() {
  const dictionary = await getServerDictionary();

  return (
    <PageShell>
      <PageHeader title={dictionary.organizationSettings.roles} />
    </PageShell>
  );
}