import "server-only";

import { BusinessWorkspaceApiGateway } from "../../infrastructure/gateways/business-workspace-api.gateway";
import { OrganizationApiGateway } from "../../infrastructure/gateways/organization-api.gateway";
import { EstablishmentApiGateway } from "../../infrastructure/gateways/establishment-api.gateway";
import { BusinessWorkspaceQueryService } from "../../application/internal/queryservices/business-workspace-query.service";
import { OrganizationCommandServiceImpl } from "../../application/internal/commandservices/organization-command.service";
import { EstablishmentCommandServiceImpl } from "../../application/internal/commandservices/establishment-command.service";
import { OrganizationQueryServiceImpl } from "../../application/internal/queryservices/organization-query.service";
import { EstablishmentQueryServiceImpl } from "../../application/internal/queryservices/establishment-query.service";
import { createOrganizationImageUploadAdapter } from "../../infrastructure/adapters/organization-image-upload.adapter";
import { createEstablishmentPhotoAdapter } from "../../infrastructure/adapters/establishment-photo.adapter";
import type { BusinessWorkspaceReader } from "../../application/ports/business-workspace-reader";
import type { OrganizationImageStorage } from "../../application/services/business.services";
import type { OrganizationRepository } from "../../domain/services/business.repositories";
import type { EstablishmentPhotoStorage } from "../../application/ports/establishment-photo-storage";
import type { EstablishmentRepository } from "../../domain/services/business.repositories";
import type {
  OrganizationCommandService,
  OrganizationQueryService,
  EstablishmentCommandService,
  EstablishmentQueryService,
} from "../../application/services/business.services";

/**
 * Server-only composition for the Business bounded context.
 *
 * Returns a fresh composition per invocation. Callers (Server Actions, Route
 * Handlers, Server Components) destructure the parts they need; they MUST NOT
 * import the gateways or services directly.
 */
export type ComposedBusinessAdapters = Readonly<{
  workspaceReader: BusinessWorkspaceReader;
  organizationRepository: OrganizationRepository;
  organizationImageStorage: OrganizationImageStorage;
  establishmentRepository: EstablishmentRepository;
  establishmentPhotoStorage: EstablishmentPhotoStorage;
  workspaceQueryService: BusinessWorkspaceQueryService;
  organizationCommandService: OrganizationCommandService;
  organizationQueryService: OrganizationQueryService;
  establishmentCommandService: EstablishmentCommandService;
  establishmentQueryService: EstablishmentQueryService;
}>;

export function composeBusinessAdapters(accessToken?: string): ComposedBusinessAdapters {
  const workspaceReader = new BusinessWorkspaceApiGateway(accessToken);
  const organizationRepository = new OrganizationApiGateway();
  const establishmentRepository = new EstablishmentApiGateway();
  const organizationImageStorage = createOrganizationImageUploadAdapter();
  const establishmentPhotoStorage = createEstablishmentPhotoAdapter();

  return {
    workspaceReader,
    organizationRepository,
    organizationImageStorage,
    establishmentRepository,
    establishmentPhotoStorage,
    workspaceQueryService: new BusinessWorkspaceQueryService(workspaceReader),
    organizationCommandService: new OrganizationCommandServiceImpl(
      organizationRepository,
      organizationImageStorage,
    ),
    organizationQueryService: new OrganizationQueryServiceImpl(
      organizationRepository,
      organizationRepository,
    ),
    establishmentCommandService: new EstablishmentCommandServiceImpl(
      establishmentRepository,
      establishmentPhotoStorage,
    ),
    establishmentQueryService: new EstablishmentQueryServiceImpl(establishmentRepository),
  };
}
