import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface NewEstablishmentPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function NewEstablishmentPage({ searchParams }: NewEstablishmentPageProps) {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(await searchParams);

  if (!workspace.organization) {
    redirect("/organizations");
  }

  if (!workspace.canCreateEstablishment) {
    redirect("/access-denied");
  }

  return <CreateEstablishmentForm organizationId={workspace.organization.id} />;
}
