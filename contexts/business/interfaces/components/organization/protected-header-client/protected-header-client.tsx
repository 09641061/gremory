"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { OrganizationSelector } from "../organization-selector/organization-selector";
import type {
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";

interface ProtectedHeaderClientProps {
  workspace: WorkspaceHeaderViewModel;
  homeHref?: string;
}

export function ProtectedHeaderClient({
  workspace,
  homeHref = "/chat",
}: ProtectedHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedEstablishmentId = searchParams.get("establishmentId") || workspace.activeEstablishmentId;

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
          organization={workspace.organization}
          organizations={workspace.organizations}
          onSelect={handleSelectOrganization}
          onSelectAll={() => {
            if (workspace.canReadOrganizations) {
              const query = selectedEstablishmentId ? `?establishmentId=${selectedEstablishmentId}` : "";
              router.push(`/organizations${query}`);
            } else {
              router.push(`${pathname}?denied=org`);
            }
          }}
        />
      }
      establishments={workspace.establishments}
      initialEstablishmentId={selectedEstablishmentId}
      canCreateEstablishment={workspace.canCreateEstablishment}
      canReadEstablishments={workspace.canReadEstablishments}
    />
  );
}
