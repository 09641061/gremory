import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
  CreateEstablishmentCommand,
  UpdateEstablishmentCommand,
  DeleteEstablishmentCommand,
} from "../model/commands/business.commands";
import type { Organization } from "../model/entities/organization.entity";
import type { Establishment } from "../model/entities/establishment.entity";

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface OrganizationCommandService {
  create(command: CreateOrganizationCommand, token?: string): Promise<Organization>;
  update(command: UpdateOrganizationCommand, token?: string): Promise<Organization>;
  delete(command: DeleteOrganizationCommand, token?: string): Promise<void>;
}

export interface OrganizationQueryService {
  getMyOrganization(token?: string): Promise<Organization>;
  getById(id: string, token?: string): Promise<Organization>;
}

export interface EstablishmentCommandService {
  create(command: CreateEstablishmentCommand, token?: string): Promise<Establishment>;
  update(command: UpdateEstablishmentCommand, token?: string): Promise<Establishment>;
  delete(command: DeleteEstablishmentCommand, token?: string): Promise<void>;
}

export interface EstablishmentQueryService {
  getByOrganization(organizationId: string, page?: number, size?: number, token?: string): Promise<PageResponse<Establishment>>;
  getById(id: string, token?: string): Promise<Establishment>;
}
