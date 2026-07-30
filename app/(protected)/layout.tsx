import type { ReactNode } from "react";
import { Suspense } from "react";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationSelector } from "@/contexts/business/interfaces/components/organization/organization-selector/organization-selector";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";

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
      <ErrorBanner />
    </div>
  );
}

async function ProtectedHeader() {
  let organization: { id: string; name: string; imageUrl?: string | null } | undefined;
  let establishments: { id: string; name: string; photoUrl?: string | null }[] = [];
  let canCreateEstablishment = true;
  let canReadOrganizations = true;
  let canReadEstablishments = true;

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
    canCreateEstablishment = false;
    canReadOrganizations = false;
    canReadEstablishments = false;
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

        canReadOrganizations = access.establishments.some(
          (item) =>
            item.organizationId === organization?.id &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "business:organizations:read" ||
                perm === "business:organizations:manage" ||
                perm === "business:manage"
            )
        );

        canReadEstablishments = access.establishments.some(
          (item) =>
            item.organizationId === organization?.id &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "business:establishments:read" ||
                perm === "business:establishments:manage" ||
                perm === "business:manage"
            )
        );

        canCreateEstablishment = access.establishments.some(
          (item) =>
            item.organizationId === organization?.id &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "business:establishments:manage" ||
                perm === "business:manage"
            )
        );
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
          canRead={canReadOrganizations}
        />
      }
      establishments={establishments}
      initialEstablishmentId={establishments[0]?.id}
      canCreateEstablishment={canCreateEstablishment}
      canReadEstablishments={canReadEstablishments}
    />
  );
}
