import "server-only";

import type {
  EstablishmentCommandService,
  EstablishmentQueryService,
  PageResponse,
} from "../../../domain/services/business.services";
import type { Establishment } from "../../../domain/model/entities/establishment.entity";
import type {
  CreateEstablishmentCommand,
  UpdateEstablishmentCommand,
  DeleteEstablishmentCommand,
} from "../../../domain/model/commands/business.commands";
import { EstablishmentApiGateway } from "../../../infrastructure/gateways/establishment-api.gateway";

export class EstablishmentCommandServiceImpl implements EstablishmentCommandService {
  constructor(private readonly gateway: EstablishmentApiGateway) {}

  create(command: CreateEstablishmentCommand, token?: string): Promise<Establishment> {
    return this.gateway.create(command, token);
  }

  update(command: UpdateEstablishmentCommand, token?: string): Promise<Establishment> {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteEstablishmentCommand, token?: string): Promise<void> {
    return this.gateway.delete(command, token);
  }
}

export class EstablishmentQueryServiceImpl implements EstablishmentQueryService {
  constructor(private readonly gateway: EstablishmentApiGateway) {}

  getByOrganization(
    organizationId: string,
    page?: number,
    size?: number,
    token?: string
  ): Promise<PageResponse<Establishment>> {
    return this.gateway.getByOrganization(organizationId, page, size, token);
  }

  getById(id: string, token?: string): Promise<Establishment> {
    return this.gateway.getById(id, token);
  }
}

export function createEstablishmentCommandService() {
  return new EstablishmentCommandServiceImpl(new EstablishmentApiGateway());
}

export function createEstablishmentQueryService() {
  return new EstablishmentQueryServiceImpl(new EstablishmentApiGateway());
}
