import type {
  CreateEstablishmentCommand,
  CreateOrganizationCommand,
  DeleteEstablishmentCommand,
  DeleteOrganizationCommand,
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
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type {
  EstablishmentSummary,
  OrganizationSummary,
  PageView,
} from "../model/business.read-models";

export interface OrganizationCommandService {
  create(command: CreateOrganizationCommand): Promise<OrganizationId>;
  update(command: UpdateOrganizationCommand): Promise<OrganizationId>;
  delete(command: DeleteOrganizationCommand): Promise<void>;
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
