import "server-only";

import type {
  CreateEstablishmentCommand,
  DeleteEstablishmentCommand,
  UpdateEstablishmentCommand,
} from "../../../domain/model/commands/business.commands";
import { createEstablishmentId } from "../../../domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName } from "../../../domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto } from "../../../domain/model/valueobjects/establishment-photo.vo";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { EstablishmentRepository } from "../../../domain/services/business.repositories";
import type { EstablishmentCommandService } from "../../services/business.services";
import { EstablishmentApiGateway } from "../../../infrastructure/gateways/establishment-api.gateway";

export class EstablishmentCommandServiceImpl implements EstablishmentCommandService {
  constructor(private readonly establishments: EstablishmentRepository) {}

  async create(command: CreateEstablishmentCommand) {
    const establishment = await this.establishments.create(
      createOrganizationId(command.organizationId),
      createEstablishmentName(command.name),
      createEstablishmentPhoto(command.photoUrl),
    );
    return establishment.id;
  }

  async update(command: UpdateEstablishmentCommand) {
    const establishment = await this.establishments.findById(
      createEstablishmentId(command.id),
    );
    if (!establishment) throw new Error("Establishment not found");
    establishment.update(command.name, command.photoUrl);
    const saved = await this.establishments.save(establishment);
    return saved.id;
  }

  delete(command: DeleteEstablishmentCommand) {
    return this.establishments.delete(createEstablishmentId(command.id));
  }
}

export function createEstablishmentCommandService(
  token?: string,
): EstablishmentCommandService {
  return new EstablishmentCommandServiceImpl(new EstablishmentApiGateway(token));
}
