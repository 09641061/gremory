"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { OrganizationSelector } from "../organization-selector/organization-selector";
import type {
  WorkspaceHeaderEstablishment,
  WorkspaceHeaderOrganization,
} from "@/contexts/business/application/model/business-workspace.view-models";

interface ProtectedHeaderClientProps {
  organization?: WorkspaceHeaderOrganization;
  organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
  establishments: ReadonlyArray<WorkspaceHeaderEstablishment>;
  activeEstablishmentId?: string;
  canReadOrganizations: boolean;
  canReadEstablishments: boolean;
  canCreateEstablishment: boolean;
  homeHref?: string;
}

export function ProtectedHeaderClient({
  organization,
  organizations,
  establishments,
  activeEstablishmentId,
  canReadOrganizations,
  canReadEstablishments,
  canCreateEstablishment,
  homeHref = "/chat",
}: ProtectedHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedEstablishmentId = searchParams.get("establishmentId") || activeEstablishmentId;

  function handleSelectOrganization(_orgId: string, defaultEstablishmentId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (defaultEstablishmentId) {
      params.set("establishmentId", defaultEstablishmentId);
    }
    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
    );
  }

  return (
    <Header
      homeHref={homeHref}
      organizationSlot={
        <OrganizationSelector
          organization={organization}
          organizations={organizations}
          canRead={canReadOrganizations}
          onSelect={handleSelectOrganization}
          activeEstablishmentId={selectedEstablishmentId}
        />
      }
      establishments={establishments}
      initialEstablishmentId={selectedEstablishmentId}
      canCreateEstablishment={canCreateEstablishment}
      canReadEstablishments={canReadEstablishments}
    />
  );
}
