import type { ReactNode } from "react";
import { Suspense } from "react";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";
import { ProtectedHeaderClient } from "@/contexts/business/interfaces/components/organization/protected-header-client/protected-header-client";

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
  let ownerData: {
    organization: { id: string; name: string; imageUrl?: string | null };
    establishments: { id: string; name: string; photoUrl?: string | null }[];
  } | undefined;

  let employeeData: {
    establishments: {
      organizationId: string;
      organizationName: string;
      establishmentId: string;
      establishmentName: string;
      effectivePermissions: string[];
    }[];
  } | undefined;

  let isLoaded = false;

  try {
    const currentOrganization =
      await createOrganizationQueryService().getMyOrganization();
    const ownerOrganization = {
      id: currentOrganization.id,
      name: currentOrganization.name,
      imageUrl: currentOrganization.imageUrl,
    };
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: ownerOrganization.id,
      page: 0,
      size: 100,
    });
    const ownerEstablishments = page.content.map((establishment) => ({
      id: establishment.id,
      name: establishment.name,
      photoUrl: establishment.photoUrl,
    }));

    ownerData = {
      organization: ownerOrganization,
      establishments: ownerEstablishments,
    };
    isLoaded = true;
  } catch {
    // Ignore owner fetch failure, fallback to employee
  }

  if (!isLoaded) {
    try {
      const access = await createTeamQueryService().getAccessContext();
      employeeData = {
        establishments: access.establishments.map((est) => ({
          organizationId: est.organizationId,
          organizationName: est.organizationName,
          establishmentId: est.establishmentId,
          establishmentName: est.establishmentName,
          effectivePermissions: Array.from(est.effectivePermissions),
        })),
      };
    } catch {
      // Ignore employee fetch failure
    }
  }

  return (
    <ProtectedHeaderClient
      ownerData={ownerData}
      employeeData={employeeData}
    />
  );
}
