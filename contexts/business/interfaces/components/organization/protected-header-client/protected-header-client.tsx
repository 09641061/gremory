"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { OrganizationSelector } from "../organization-selector/organization-selector";

export type HeaderEstablishment = {
  id: string;
  name: string;
  photoUrl?: string | null;
};

export type HeaderOrganization = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

export type EmployeeEstablishmentAccess = {
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  effectivePermissions: string[];
};

interface ProtectedHeaderClientProps {
  ownerData?: {
    organization: HeaderOrganization;
    establishments: HeaderEstablishment[];
  };
  employeeData?: {
    establishments: EmployeeEstablishmentAccess[];
  };
  homeHref?: string;
}

export function ProtectedHeaderClient({ ownerData, employeeData, homeHref = "/chat" }: ProtectedHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Resolve Active Establishment ID
  const selectedEstablishmentId = searchParams.get("establishmentId") || undefined;

  // 2. Resolve Active Organization and Establishments list
  let activeOrg: HeaderOrganization | undefined;
  let visibleEstablishments: HeaderEstablishment[] = [];
  let uniqueOrganizations: HeaderOrganization[] = [];
  let canReadOrganizations = true;
  let canReadEstablishments = true;
  let canCreateEstablishment = true;

  if (ownerData) {
    activeOrg = ownerData.organization;
    visibleEstablishments = ownerData.establishments;
    uniqueOrganizations = [ownerData.organization];
  } else if (employeeData) {
    const list = employeeData.establishments;

    // Build unique organizations list
    const orgMap = new Map<string, HeaderOrganization>();
    list.forEach((item) => {
      if (!orgMap.has(item.organizationId)) {
        orgMap.set(item.organizationId, {
          id: item.organizationId,
          name: item.organizationName,
          imageUrl: null,
        });
      }
    });
    uniqueOrganizations = Array.from(orgMap.values());

    // Resolve active organization based on selected establishment
    let activeEstablishment = list.find((item) => item.establishmentId === selectedEstablishmentId);
    if (!activeEstablishment && list.length > 0) {
      activeEstablishment = list[0];
    }

    if (activeEstablishment) {
      activeOrg = {
        id: activeEstablishment.organizationId,
        name: activeEstablishment.organizationName,
        imageUrl: null,
      };

      // Filter visible establishments to match active organization
      visibleEstablishments = list
        .filter((item) => item.organizationId === activeOrg?.id)
        .map((item) => ({
          id: item.establishmentId,
          name: item.establishmentName,
          photoUrl: null,
        }));

      // Calculate dynamic permissions based on active organization
      canReadOrganizations = list.some(
        (item) =>
          item.organizationId === activeOrg?.id &&
          item.effectivePermissions.some(
            (perm) =>
              perm === "business:organizations:read" ||
              perm === "business:organizations:manage" ||
              perm === "business:manage",
          ),
      );

      canReadEstablishments = list.some(
        (item) =>
          item.organizationId === activeOrg?.id &&
          item.effectivePermissions.some(
            (perm) =>
              perm === "business:establishments:read" ||
              perm === "business:establishments:manage" ||
              perm === "business:manage",
          ),
      );

      canCreateEstablishment = list.some(
        (item) =>
          item.organizationId === activeOrg?.id &&
          item.effectivePermissions.some(
            (perm) => perm === "business:establishments:manage" || perm === "business:manage",
          ),
      );
    }
  }

  // 3. Organization Selection Action
  function handleSelectOrganization(orgId: string) {
    if (ownerData) return;
    if (employeeData) {
      const firstEstOfOrg = employeeData.establishments.find((item) => item.organizationId === orgId);
      if (firstEstOfOrg) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("establishmentId", firstEstOfOrg.establishmentId);
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  }

  return (
    <Header
      homeHref={homeHref}
      organizationSlot={
        <OrganizationSelector
          organization={activeOrg}
          organizations={uniqueOrganizations}
          canRead={canReadOrganizations}
          onSelect={handleSelectOrganization}
          activeEstablishmentId={selectedEstablishmentId}
        />
      }
      establishments={visibleEstablishments}
      initialEstablishmentId={visibleEstablishments[0]?.id}
      canCreateEstablishment={canCreateEstablishment}
      canReadEstablishments={canReadEstablishments}
    />
  );
}
