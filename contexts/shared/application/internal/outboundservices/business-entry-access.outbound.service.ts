import "server-only";

import { BusinessEntryAccessGateway } from "@/contexts/business/infrastructure/gateways/business-entry-access.gateway";

export type EntryOrganization = Readonly<{ id: string }>;
export type EntryEstablishment = Readonly<{ id: string }>;

export class BusinessEntryAccessOutboundService {
  async getOwnedOrganization(accessToken: string): Promise<EntryOrganization> {
    const organization = await new BusinessEntryAccessGateway(accessToken).getOwnedOrganization();
    return { id: organization.id };
  }

  async getOrganizationEstablishments(
    accessToken: string,
    organizationId: string,
  ): Promise<ReadonlyArray<EntryEstablishment>> {
    const page = await new BusinessEntryAccessGateway(accessToken).getOrganizationEstablishments(organizationId);

    return page.map((establishment) => ({ id: establishment.id }));
  }
}

export function createBusinessEntryAccessOutboundService() {
  return new BusinessEntryAccessOutboundService();
}

