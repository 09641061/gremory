import type { EstablishmentSummary, PageView } from "../model/business.read-models";
import type { EstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import type { EstablishmentName } from "../../domain/model/valueobjects/establishment-name.vo";
import type { EstablishmentPhoto } from "../../domain/model/valueobjects/establishment-photo.vo";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";

export interface EstablishmentReaderWriter {
  create(
    organizationId: OrganizationId,
    name: EstablishmentName,
    photoUrl: EstablishmentPhoto,
    timeZone: string,
  ): Promise<EstablishmentSummary>;
  findById(id: EstablishmentId): Promise<EstablishmentSummary | null>;
  findByOrganization(
    organizationId: OrganizationId,
    page: number,
    size: number,
  ): Promise<PageView<EstablishmentSummary>>;
  save(establishmentId: EstablishmentId, name: EstablishmentName): Promise<EstablishmentSummary>;
  delete(id: EstablishmentId, organizationId: OrganizationId): Promise<void>;
}
