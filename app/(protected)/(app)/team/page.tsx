import { Suspense } from "react";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";
import { TeamRoster } from "@/contexts/workforce/interfaces/components/team-roster";

interface TeamPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default function TeamPage({ searchParams }: TeamPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TeamPageContent({ searchParams }: TeamPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService()
    .getHeaderViewModel(query)
    .catch(() => null);

  return <TeamRoster establishmentId={workspace?.activeEstablishmentId ?? null} />;
}
