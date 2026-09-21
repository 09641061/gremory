import "server-only";

import { BusinessWorkspaceApiGateway } from "../../infrastructure/gateways/business-workspace-api.gateway";
import { OrganizationApiGateway } from "../../infrastructure/gateways/organization-api.gateway";
import { EstablishmentApiGateway } from "../../infrastructure/gateways/establishment-api.gateway";
import { BusinessWorkspaceQueryService } from "../../application/internal/queryservices/business-workspace-query.service";
import { OrganizationCommandServiceImpl } from "../../application/internal/commandservices/organization-command.service";
import { EstablishmentCommandServiceImpl } from "../../application/internal/commandservices/establishment-command.service";
import { createOrganizationImageUploadAdapter } from "../../infrastructure/adapters/organization-image-upload.adapter";
import { createEstablishmentPhotoAdapter } from "../../infrastructure/adapters/establishment-photo.adapter";

/**
 * Server-only composition for the Business bounded context.
 *
 * Returns a fresh composition per invocation. Callers (Server Actions, Route
 * Handlers, Server Components) destructure the parts they need; they MUST NOT
 * import the gateways or services directly.
 *
 * Migration target: the new Application ports
 *   - `application/ports/business-workspace-reader.ts`
 *   - `application/ports/organization-reader-writer.ts`
 *   - `application/ports/establishment-reader-writer.ts`
 * remain the consumer-owned contracts the gateways will eventually implement.
 * Until then, this composition hands out the existing command/query
 * services so callers stop reaching into the gateways themselves.
 */
export type ComposedBusinessAdapters = Readonly<{
  workspaceGateway: BusinessWorkspaceApiGateway;
  organizationGateway: OrganizationApiGateway;
  establishmentGateway: EstablishmentApiGateway;
  workspaceQueryService: BusinessWorkspaceQueryService;
  organizationCommandService: OrganizationCommandServiceImpl;
  establishmentCommandService: EstablishmentCommandServiceImpl;
}>;

export function composeBusinessAdapters(): ComposedBusinessAdapters {
  const workspaceGateway = new BusinessWorkspaceApiGateway();
  const organizationGateway = new OrganizationApiGateway();
  const establishmentGateway = new EstablishmentApiGateway();
  const organizationImageUpload = createOrganizationImageUploadAdapter();
  const establishmentPhotoUpload = createEstablishmentPhotoAdapter();

  return {
    workspaceGateway,
    organizationGateway,
    establishmentGateway,
    workspaceQueryService: new BusinessWorkspaceQueryService(workspaceGateway),
    organizationCommandService: new OrganizationCommandServiceImpl(organizationGateway, organizationImageUpload),
    establishmentCommandService: new EstablishmentCommandServiceImpl(establishmentGateway, establishmentPhotoUpload),
  };
}
