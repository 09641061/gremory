"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";
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
  const homeHrefWithEstablishment = selectedEstablishmentId
    ? `${homeHref}?establishmentId=${selectedEstablishmentId}`
    : homeHref;

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
      homeHref={homeHrefWithEstablishment}
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
      establishmentSlot={
        <EstablishmentSelector
          establishments={workspace.establishments}
          selectedEstablishmentId={selectedEstablishmentId}
          onSelect={(establishmentId) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("establishmentId", establishmentId);
            router.push(`${pathname}?${params.toString()}`);
          }}
          onSelectAll={() => {
            if (workspace.canReadEstablishments) {
              const query = selectedEstablishmentId ? `?establishmentId=${selectedEstablishmentId}` : "";
              router.push(`/establishments${query}`);
            } else {
              router.push(`${pathname}?denied=est`);
            }
          }}
          onNew={
            workspace.canCreateEstablishment ? () => router.push("/establishments/new") : undefined
          }
        />
      }
    />
  );
}
