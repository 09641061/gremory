import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface NewOrganizationPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function NewOrganizationPage({ searchParams }: NewOrganizationPageProps) {
  const query = await searchParams;
  const creation = await createBusinessWorkspaceQueryService().getOrganizationCreationState(query);

  if (creation.status === "denied") {
    redirect("/organizations");
  }

  return <CreateOrganizationForm />;
}
