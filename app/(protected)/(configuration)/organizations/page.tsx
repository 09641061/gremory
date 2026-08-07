import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";
import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface OrganizationsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsPageProps) {
  const { establishmentId } = await searchParams;
  const pageState = await createBusinessWorkspaceQueryService().getOrganizationPageState(establishmentId);

  if (pageState.status === "create") {
    return <CreateOrganizationForm />;
  }

  if (pageState.status === "denied") {
    redirect("/?denied=org");
  }

  return <OrganizationsPageView organization={pageState.organization} canUpdate={pageState.canUpdate} />;
}
