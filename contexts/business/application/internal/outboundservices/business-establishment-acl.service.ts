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
      const organization = await createOrganizationQueryService().getMyOrganization({}, token);
      const establishments = await createEstablishmentQueryService().getByOrganization(
        { organizationId: organization.props.id.value, page: 0, size: 1 },
        token
      );
      return establishments.content[0]?.props.id.value ?? null;
    } catch {
      return null;
    }
  }
}

export function createBusinessEstablishmentAclService(): BusinessEstablishmentAclService {
  return new BusinessEstablishmentAclService();
}
