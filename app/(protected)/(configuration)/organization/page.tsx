import { redirect } from "next/navigation";
import { OrganizationSettingsCard } from "@/contexts/business/interfaces/components/organization/organization-settings/organization-settings-card";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";

interface OrganizationPageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

export default async function OrganizationRoutePage({ searchParams }: OrganizationPageProps) {
  const query = await searchParams;
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel(query);

  if (query.organizationId && query.organizationId === workspace.ownedOrganizationId) {
    const organization = await composeBusinessAdapters().organizationQueryService.getById({
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

  const pageState = await composeBusinessAdapters().workspaceQueryService.getOrganizationPageState(query);

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
