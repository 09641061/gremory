import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";
import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface OrganizationsPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsPageProps) {
  const query = await searchParams;
  const pageState = await createBusinessWorkspaceQueryService().getOrganizationPageState(query);

  if (pageState.status === "create") {
    return <CreateOrganizationForm />;
  }

  if (pageState.status === "denied") {
    redirect("/access-denied");
  }

  return (
    <OrganizationsPageView
      key={pageState.activeOrganizationId ?? "default"}
      organizations={pageState.organizations}
      activeOrganizationId={pageState.activeOrganizationId}
      canCreate={pageState.canCreateOrganization}
    />
  );
}
