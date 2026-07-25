import React from "react";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { OrganizationSelector } from "@/contexts/business/interfaces/components/organization-selector";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organization: { id: string; name: string } | undefined;
  let establishments: { id: string; name: string }[] = [];

  try {
    const currentOrganization = await createOrganizationQueryService().getMyOrganization();
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
    // Keep the app shell available when Business data is unavailable.
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
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
      <Sidebar />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </div>
  );
}
