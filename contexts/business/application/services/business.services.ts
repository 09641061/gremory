import type {
  CreateEstablishmentCommand,
  CreateOrganizationCommand,
  DeleteEstablishmentCommand,
  UpdateEstablishmentCommand,
  UpdateOrganizationCommand,
} from "../../domain/model/commands/business.commands";
import type {
  GetEstablishmentByIdQuery,
  GetMyOrganizationQuery,
  GetOrganizationByIdQuery,
  ListEstablishmentsByOrganizationQuery,
} from "../../domain/model/queries/business.queries";
import type { EstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import type { EstablishmentPhoto } from "../../domain/model/valueobjects/establishment-photo.vo";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import type {
  EstablishmentSummary,
  OrganizationSummary,
  PageView,
} from "../model/business.read-models";

/**
 * Image storage sits outside the write model: the file is stored first and only
 * the resulting reference reaches the entity. Command services depend on these
 * ports so no server action has to touch infrastructure itself.
 */
export interface OrganizationImageStorage {
  /** The backend stores the logo and the name in a single multipart write. */
  upload(id: OrganizationId, name: OrganizationName, image: File): Promise<void>;
}

export interface EstablishmentPhotoStorage {
  upload(photo: File): Promise<EstablishmentPhoto>;
  remove(id: EstablishmentId): Promise<void>;
}

export interface OrganizationCommandService {
  /** Onboarding step 1, and the entry point for a member starting their own business. */
  create(command: CreateOrganizationCommand): Promise<OrganizationId>;
  update(command: UpdateOrganizationCommand): Promise<OrganizationId>;
}

export interface OrganizationQueryService {
  getMyOrganization(query?: GetMyOrganizationQuery): Promise<OrganizationSummary>;
  getById(query: GetOrganizationByIdQuery): Promise<OrganizationSummary | null>;
}

export interface EstablishmentCommandService {
  create(command: CreateEstablishmentCommand): Promise<EstablishmentId>;
  update(command: UpdateEstablishmentCommand): Promise<EstablishmentId>;
  delete(command: DeleteEstablishmentCommand): Promise<void>;
}

export interface EstablishmentQueryService {
  getById(query: GetEstablishmentByIdQuery): Promise<EstablishmentSummary | null>;
  getByOrganization(
    query: ListEstablishmentsByOrganizationQuery,
  ): Promise<PageView<EstablishmentSummary>>;
}
