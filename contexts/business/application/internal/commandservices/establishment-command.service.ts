import "server-only";

import type {
  CreateEstablishmentCommand,
  DeleteEstablishmentCommand,
  UpdateEstablishmentCommand,
} from "../../../domain/model/commands/business.commands";
import type { EstablishmentCommandService } from "../../../domain/services/business.services";
import { EstablishmentApiGateway } from "../../../infrastructure/gateways/establishment-api.gateway";
export { createEstablishmentQueryService } from "../queryservices/establishment-query.service";

export class EstablishmentCommandServiceImpl implements EstablishmentCommandService {
  constructor(private readonly gateway: EstablishmentCommandService = new EstablishmentApiGateway()) {}

  create(command: CreateEstablishmentCommand, token?: string) {
    return this.gateway.create(command, token);
  }

  update(command: UpdateEstablishmentCommand, token?: string) {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteEstablishmentCommand, token?: string) {
    return this.gateway.delete(command, token);
  }
}

export function createEstablishmentCommandService(): EstablishmentCommandService {
  return new EstablishmentCommandServiceImpl();
}
