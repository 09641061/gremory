import "server-only";

import type { UpdateOrganizationCommand } from "../../../domain/model/commands/business.commands";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationRepository } from "../../../domain/services/business.repositories";
import type { OrganizationCommandService } from "../../services/business.services";
import { createOrganizationAdapter } from "@/contexts/business/infrastructure/adapters/organization.adapter";

export class OrganizationCommandServiceImpl implements OrganizationCommandService {
  constructor(private readonly organizations: OrganizationRepository) {}

  async update(command: UpdateOrganizationCommand) {
    const organization = await this.organizations.findById(
      createOrganizationId(command.id),
    );
    if (!organization) throw new Error("Organization not found");
    organization.update(command.name, command.imageUrl);
    const saved = await this.organizations.save(organization);
    return saved.id;
  }
}

export function createOrganizationCommandService(
): OrganizationCommandService {
  return new OrganizationCommandServiceImpl(createOrganizationAdapter());
}
