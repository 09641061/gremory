import type { Establishment } from "../model/entities/establishment.entity";
import type { Organization } from "../model/entities/organization.entity";
import type { EstablishmentId } from "../model/valueobjects/establishment-id.vo";
import type { EstablishmentName } from "../model/valueobjects/establishment-name.vo";
import type { EstablishmentPhoto } from "../model/valueobjects/establishment-photo.vo";
import type { OrganizationId } from "../model/valueobjects/organization-id.vo";
import type { OrganizationName } from "../model/valueobjects/organization-name.vo";

export interface PageResult<T> {
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

// Onboarding step 1 (owner) and the member-starts-their-own-business path both
// call `create`: the account authenticates the request, so no owner ID travels
// through this contract.
export interface OrganizationRepository {
  create(name: OrganizationName, imageFile?: File | null): Promise<Organization>;
  findMine(): Promise<Organization>;
  findById(id: OrganizationId): Promise<Organization | null>;
  save(organization: Organization): Promise<Organization>;
}

export interface EstablishmentRepository {
  create(
    organizationId: OrganizationId,
    name: EstablishmentName,
    photoUrl: EstablishmentPhoto,
    timeZone: string,
  ): Promise<Establishment>;
  findById(id: EstablishmentId): Promise<Establishment | null>;
  findByOrganization(
    organizationId: OrganizationId,
    page: number,
    size: number,
  ): Promise<PageResult<Establishment>>;
  save(establishment: Establishment): Promise<Establishment>;
  delete(id: EstablishmentId, organizationId: OrganizationId): Promise<void>;
}
