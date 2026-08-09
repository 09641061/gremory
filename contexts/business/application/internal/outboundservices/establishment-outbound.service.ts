import "server-only";

import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import type { Establishment } from "../../../domain/model/entities/establishment.entity";
import type { EstablishmentId } from "../../../domain/model/valueobjects/establishment-id.vo";
import type { EstablishmentName } from "../../../domain/model/valueobjects/establishment-name.vo";
import type { EstablishmentPhoto } from "../../../domain/model/valueobjects/establishment-photo.vo";
import type { OrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { EstablishmentRepository, PageResult } from "../../../domain/services/business.repositories";

export class EstablishmentOutboundService implements EstablishmentRepository {
  constructor(private readonly gateway = new EstablishmentApiGateway()) {}

  create(
    organizationId: OrganizationId,
    name: EstablishmentName,
    photoUrl: EstablishmentPhoto,
  ): Promise<Establishment> {
    return this.gateway.create(organizationId, name, photoUrl);
  }

  findById(id: EstablishmentId): Promise<Establishment | null> {
    return this.gateway.findById(id);
  }

  findByOrganization(
    organizationId: OrganizationId,
    page: number,
    size: number,
  ): Promise<PageResult<Establishment>> {
    return this.gateway.findByOrganization(organizationId, page, size);
  }

  save(establishment: Establishment): Promise<Establishment> {
    return this.gateway.save(establishment);
  }

  deletePhoto(id: EstablishmentId): Promise<void> {
    return this.gateway.deletePhoto(id);
  }

  delete(id: EstablishmentId): Promise<void> {
    return this.gateway.delete(id);
  }
}

export function createEstablishmentOutboundService() {
  return new EstablishmentOutboundService();
}
