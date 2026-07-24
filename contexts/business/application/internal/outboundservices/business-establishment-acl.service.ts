import "server-only";

import { createOrganizationQueryService } from "../commandservices/organization-command.service";
import { createEstablishmentQueryService } from "../commandservices/establishment-command.service";

export class BusinessEstablishmentAclService {
  async getActiveEstablishmentIdForUser(token?: string): Promise<string | null> {
    try {
      const orgQueryService = createOrganizationQueryService();
      const org = await orgQueryService.getMyOrganization(token);

      const establishmentQueryService = createEstablishmentQueryService();
      const establishmentsPage = await establishmentQueryService.getByOrganization(
        org.props.id.value,
        0,
        1,
        token
      );

      const activeEst = establishmentsPage.content.find((e) => e.props.active) ?? establishmentsPage.content[0];
      return activeEst ? activeEst.props.id.value : null;
    } catch {
      return null;
    }
  }
}

export function createBusinessEstablishmentAclService() {
  return new BusinessEstablishmentAclService();
}
