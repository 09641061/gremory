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
import type {
  EstablishmentCommandService,
  EstablishmentPhotoStorage,
} from "../../services/business.services";
import { createEstablishmentAdapter } from "@/contexts/business/infrastructure/adapters/establishment.adapter";
import { createEstablishmentPhotoAdapter } from "@/contexts/business/infrastructure/adapters/establishment-photo.adapter";

export class EstablishmentCommandServiceImpl implements EstablishmentCommandService {
  constructor(
    private readonly establishments: EstablishmentRepository,
    private readonly photos: EstablishmentPhotoStorage,
  ) {}

  async create(command: CreateEstablishmentCommand) {
    const photo = command.photoFile
      ? await this.photos.upload(command.photoFile)
      : createEstablishmentPhoto(command.photoUrl);

    const establishment = await this.establishments.create(
      createOrganizationId(command.organizationId),
      createEstablishmentName(command.name),
      photo,
      command.timeZone ?? "UTC",
    );
    return establishment.id;
  }

  async update(command: UpdateEstablishmentCommand) {
    const id = createEstablishmentId(command.id);
    const establishment = await this.establishments.findById(id);
    if (!establishment) throw new Error("Establishment not found");

    const photo = await this.resolvePhoto(id, command);
    establishment.update(command.name, photo.value, command.timeZone, command.ownerAvailableForScheduling);
    const saved = await this.establishments.save(establishment);
    return saved.id;
  }

  delete(command: DeleteEstablishmentCommand) {
    return this.establishments.delete(createEstablishmentId(command.id));
  }

  /** A replacement wins over a removal: both together is a contradictory intent. */
  private async resolvePhoto(
    id: ReturnType<typeof createEstablishmentId>,
    command: UpdateEstablishmentCommand,
  ) {
    if (command.photoFile) return this.photos.upload(command.photoFile);

    if (command.removePhoto) {
      await this.photos.remove(id);
      return createEstablishmentPhoto(null);
    }

    return createEstablishmentPhoto(command.photoUrl);
  }
}

export function createEstablishmentCommandService(): EstablishmentCommandService {
  return new EstablishmentCommandServiceImpl(
    createEstablishmentAdapter(),
    createEstablishmentPhotoAdapter(),
  );
}
