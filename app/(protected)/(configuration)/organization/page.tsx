import { redirect } from "next/navigation";
import { OrganizationSettingsCard } from "@/contexts/business/interfaces/components/organization/organization-settings/organization-settings-card";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";

interface OrganizationPageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

export default async function OrganizationRoutePage({ searchParams }: OrganizationPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  if (query.organizationId && query.organizationId === workspace.ownedOrganizationId) {
    const organization = await createOrganizationQueryService().getById({
      id: query.organizationId,
    });

    if (!organization) {
      redirect("/access-denied");
    }

    return (
      <OrganizationSettingsCard
        organization={{
          id: organization.id,
          name: organization.name,
          imageUrl: organization.imageUrl,
        }}
        canUpdate
      />
    );
  }

  const pageState = await createBusinessWorkspaceQueryService().getOrganizationPageState(query);

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
