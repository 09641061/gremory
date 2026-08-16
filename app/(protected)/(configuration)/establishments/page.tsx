import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface EstablishmentsPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function EstablishmentsRoutePage({ searchParams }: EstablishmentsPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const selectedEstablishmentId = query.establishmentId ?? workspace.activeEstablishmentId;
  const selectedEstablishment = selectedEstablishmentId
    ? workspace.establishments.find((establishment) => establishment.id === selectedEstablishmentId) ?? null
    : null;

  if (!workspace.organization || !workspace.canReadEstablishments) {
    redirect("/access-denied");
  }

  return (
    <EstablishmentsPage
      initialSelectedEstablishmentId={selectedEstablishmentId ?? undefined}
      selectedEstablishment={
        selectedEstablishment
          ? {
              id: selectedEstablishment.id,
              name: selectedEstablishment.name,
              photoUrl: selectedEstablishment.photoUrl ?? null,
              timeZone: selectedEstablishment.timeZone ?? null,
            }
          : null
      }
      establishments={workspace.establishments.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        photoUrl: establishment.photoUrl ?? null,
        timeZone: establishment.timeZone ?? null,
      }))}
      canUpdateMap={Object.fromEntries(
        workspace.establishments.map((establishment) => [establishment.id, establishment.canUpdate === true]),
      )}
      defaultCanUpdate={workspace.accountType === "OWNER"}
      canCreate={workspace.canCreateEstablishment}
    />
  );
}
