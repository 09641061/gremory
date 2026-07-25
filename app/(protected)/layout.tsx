import type { ReactNode } from "react";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationSelector } from "@/contexts/business/interfaces/components/organization-selector";
import { Header } from "@/contexts/shared/interfaces/components/header";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  let organization: { id: string; name: string } | undefined;
  let establishments: { id: string; name: string }[] = [];

  try {
    const currentOrganization =
      await createOrganizationQueryService().getMyOrganization();
    organization = {
      id: currentOrganization.props.id.value,
      name: currentOrganization.props.name.value,
    };
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: organization.id,
      page: 0,
      size: 100,
    });
    establishments = page.content.map((establishment) => ({
      id: establishment.props.id.value,
      name: establishment.props.name.value,
    }));
  } catch {
    // Keep protected pages available when Business data is unavailable.
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Header
        organizationSlot={
          <OrganizationSelector
            organization={organization}
            organizations={organization ? [organization] : []}
          />
        }
        establishments={establishments}
        initialEstablishmentId={establishments[0]?.id}
      />
      {children}
    </div>
  );
}
