import "server-only";

import { createOrganizationQueryService } from "../queryservices/organization-query.service";
import { createEstablishmentQueryService } from "../queryservices/establishment-query.service";

/**
 * Consumer-facing ACL used by other contexts that only need an establishment id.
 * It deliberately exposes a primitive and never leaks Business entities.
 */
export class BusinessEstablishmentAclService {
  async getActiveEstablishmentIdForUser(token?: string): Promise<string | null> {
    try {
      const organization = await createOrganizationQueryService(
        token,
      ).getMyOrganization();
      const establishments = await createEstablishmentQueryService(
        token,
      ).getByOrganization({
        organizationId: organization.id,
        page: 0,
        size: 1,
      });
      return establishments.content[0]?.id ?? null;
    } catch {
      return null;
    }
  }
}

export function createBusinessEstablishmentAclService(): BusinessEstablishmentAclService {
  return new BusinessEstablishmentAclService();
}
