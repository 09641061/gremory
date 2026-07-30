import type { ReactNode } from "react";
import { Suspense } from "react";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationSelector } from "@/contexts/business/interfaces/components/organization/organization-selector/organization-selector";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <Header
            organizationSlot={<OrganizationSelector />}
            establishments={[]}
          />
        }
      >
        <ProtectedHeader />
      </Suspense>
      {children}
    </div>
  );
}

async function ProtectedHeader() {
  let organization: { id: string; name: string; imageUrl?: string | null } | undefined;
  let establishments: { id: string; name: string; photoUrl?: string | null }[] = [];

  try {
    const currentOrganization =
      await createOrganizationQueryService().getMyOrganization();
    organization = {
      id: currentOrganization.id,
      name: currentOrganization.name,
      imageUrl: currentOrganization.imageUrl,
    };
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: organization.id,
      page: 0,
      size: 100,
    });
    establishments = page.content.map((establishment) => ({
      id: establishment.id,
      name: establishment.name,
      photoUrl: establishment.photoUrl,
    }));
  } catch {
    // Members do not own the organization, so Business's owner-scoped
    // endpoints cannot provide their header context. Resolve it from their
    // active workforce memberships instead.
    try {
      const access = await createTeamQueryService().getAccessContext();
      const firstEstablishment = access.establishments[0];
      if (firstEstablishment) {
        organization = {
          id: firstEstablishment.organizationId,
          name: firstEstablishment.organizationName,
        };
        establishments = access.establishments
          .filter((item) => item.organizationId === organization?.id)
          .map((item) => ({
            id: item.establishmentId,
            name: item.establishmentName,
          }));
      }
    } catch {
      // Keep protected pages available when both contexts are unavailable.
    }
  }

  return (
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
  );
}
