import type { Organization } from "../model/entities/organization.entity";
import type { Establishment } from "../model/entities/establishment.entity";
import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
  CreateEstablishmentCommand,
  UpdateEstablishmentCommand,
  DeleteEstablishmentCommand,
} from "../model/commands/business.commands";
import type {
  GetOrganizationByIdQuery,
  GetMyOrganizationQuery,
  GetEstablishmentByIdQuery,
  ListEstablishmentsByOrganizationQuery,
} from "../model/queries/business.queries";

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface OrganizationCommandService {
  create(command: CreateOrganizationCommand, token?: string): Promise<Organization>;
  update(command: UpdateOrganizationCommand, token?: string): Promise<Organization>;
  delete(command: DeleteOrganizationCommand, token?: string): Promise<void>;
}

export interface OrganizationQueryService {
  getMyOrganization(query?: GetMyOrganizationQuery, token?: string): Promise<Organization>;
  getById(query: GetOrganizationByIdQuery, token?: string): Promise<Organization>;
}

export interface EstablishmentCommandService {
  create(command: CreateEstablishmentCommand, token?: string): Promise<Establishment>;
  update(command: UpdateEstablishmentCommand, token?: string): Promise<Establishment>;
  delete(command: DeleteEstablishmentCommand, token?: string): Promise<void>;
}

export interface EstablishmentQueryService {
  getById(query: GetEstablishmentByIdQuery, token?: string): Promise<Establishment>;
  getByOrganization(query: ListEstablishmentsByOrganizationQuery, token?: string): Promise<PageResponse<Establishment>>;
  getByOrganization(organizationId: string, page?: number, size?: number, token?: string): Promise<PageResponse<Establishment>>;
}
