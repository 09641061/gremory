import "server-only";

import { apiConfig } from "@/api.config";
import { businessGet } from "../http/business-api.client";

export type BusinessEntryOrganizationResource = Readonly<{ id: string }>;
export type BusinessEntryEstablishmentResource = Readonly<{ id: string }>;

export class BusinessEntryAccessGateway {
  constructor(private readonly providedToken?: string) {}

  async getOwnedOrganization(): Promise<BusinessEntryOrganizationResource> {
    return businessGet<BusinessEntryOrganizationResource>(apiConfig.routes.organizations, this.providedToken);
  }

  async getOrganizationEstablishments(
    organizationId: string,
  ): Promise<ReadonlyArray<BusinessEntryEstablishmentResource>> {
    const page = await businessGet<{
      content?: ReadonlyArray<BusinessEntryEstablishmentResource>;
    }>(
      `${apiConfig.routes.establishments}/organization/${encodeURIComponent(organizationId)}?page=0&size=1`,
      this.providedToken,
    );

    return page.content ?? [];
  }
}

