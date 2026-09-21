import type { OrganizationSummary } from "../model/business.read-models";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import type { OrganizationImageInput } from "./organization-image-input";

/**
 * Server-only contract for organization reads/writes. Implementations live in
 * Infrastructure; Application receives this port via composition.
 *
 * The contract returns transport-neutral view models. Pagination is bounded
 * and validation happens in Infrastructure.
 */
export interface OrganizationReaderWriter {
  create(name: OrganizationName, image?: OrganizationImageInput | null): Promise<OrganizationSummary>;
  findMine(): Promise<OrganizationSummary>;
  findById(id: OrganizationId): Promise<OrganizationSummary | null>;
  save(name: OrganizationName, image?: OrganizationImageInput | null): Promise<OrganizationSummary>;
}
