import "server-only";

import type {
  GetEstablishmentByIdQuery,
  ListEstablishmentsByOrganizationQuery,
} from "../../../domain/model/queries/business.queries";
import { createEstablishmentId } from "../../../domain/model/valueobjects/establishment-id.vo";
import { createOrganizationId } from "../../../domain/model/valueobjects/organization-id.vo";
import type { EstablishmentRepository } from "../../../domain/services/business.repositories";
import type { EstablishmentQueryService } from "../../services/business.services";
import type {
  EstablishmentSummary,
  PageView,
} from "../../model/business.read-models";
import { createEstablishmentAdapter } from "@/contexts/business/infrastructure/adapters/establishment.adapter";

export class EstablishmentQueryServiceImpl implements EstablishmentQueryService {
  constructor(private readonly establishments: EstablishmentRepository) {}

  async getById(
    query: GetEstablishmentByIdQuery,
  ): Promise<EstablishmentSummary | null> {
    const establishment = await this.establishments.findById(
      createEstablishmentId(query.id),
    );
    return establishment ? toEstablishmentSummary(establishment) : null;
  }

  async getByOrganization(
    query: ListEstablishmentsByOrganizationQuery,
  ): Promise<PageView<EstablishmentSummary>> {
    const page = await this.establishments.findByOrganization(
      createOrganizationId(query.organizationId),
      query.page ?? 0,
      query.size ?? 20,
    );
    return {
      ...page,
      content: page.content.map(toEstablishmentSummary),
    };
  }
}

export function createEstablishmentQueryService(
): EstablishmentQueryService {
  return new EstablishmentQueryServiceImpl(createEstablishmentAdapter());
}

function toEstablishmentSummary(
  establishment: NonNullable<
    Awaited<ReturnType<EstablishmentRepository["findById"]>>
  >,
): EstablishmentSummary {
  return {
    id: establishment.id.value,
    organizationId: establishment.organizationId.value,
    name: establishment.name.value,
    photoUrl: establishment.photoUrl.value,
    timeZone: establishment.timeZone,
  };
}
