import { redirect } from "next/navigation";
import { OrganizationSettingsCard } from "@/contexts/business/interfaces/components/organization/organization-settings/organization-settings-card";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface OrganizationPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function OrganizationRoutePage({ searchParams }: OrganizationPageProps) {
  const pageState = await createBusinessWorkspaceQueryService().getOrganizationPageState(
    await searchParams,
  );

  if (pageState.status === "denied") {
    redirect("/access-denied");
  }

  return (
    <OrganizationSettingsCard
      organization={{
        id: pageState.organization.id,
        name: pageState.organization.name,
        imageUrl: pageState.organization.imageUrl,
      }}
      canUpdate={pageState.canUpdate}
    />
  );
}
