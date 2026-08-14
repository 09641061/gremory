import "server-only";

import type { UpdateOrganizationCommand } from "../../../domain/model/commands/business.commands";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationRepository } from "../../../domain/services/business.repositories";
import type {
  OrganizationCommandService,
  OrganizationImageStorage,
} from "../../services/business.services";
import { createOrganizationAdapter } from "@/contexts/business/infrastructure/adapters/organization.adapter";
import { createOrganizationImageUploadAdapter } from "@/contexts/business/infrastructure/adapters/organization-image-upload.adapter";

export class OrganizationCommandServiceImpl implements OrganizationCommandService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly images: OrganizationImageStorage,
  ) {}

  async update(command: UpdateOrganizationCommand) {
    const organization = await this.organizations.findById(
      createOrganizationId(command.id),
    );
    if (!organization) throw new Error("Organization not found");

    // The entity validates the name before either write path runs, so uploading
    // a logo can never smuggle an invalid name past the domain.
    organization.update(command.name, command.imageUrl);

    if (command.imageFile) {
      await this.images.upload(organization.id, organization.name, command.imageFile);
      return organization.id;
    }

    const saved = await this.organizations.save(organization);
    return saved.id;
  }
}

export function createOrganizationCommandService(): OrganizationCommandService {
  return new OrganizationCommandServiceImpl(
    createOrganizationAdapter(),
    createOrganizationImageUploadAdapter(),
  );
}
