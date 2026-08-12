import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface EstablishmentsPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function EstablishmentsRoutePage({ searchParams }: EstablishmentsPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  if (!workspace.organization || !workspace.canReadEstablishments) {
    redirect("/access-denied");
  }

  return (
    <EstablishmentsPage
      establishments={workspace.establishments.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        photoUrl: establishment.photoUrl ?? null,
        timeZone: establishment.timeZone ?? null,
      }))}
      canUpdateMap={Object.fromEntries(
        workspace.establishments.map((establishment) => [establishment.id, establishment.canUpdate === true]),
      )}
      defaultCanUpdate={workspace.organization.mode === "OWNER"}
      canCreate={workspace.canCreateEstablishment}
    />
  );
}
