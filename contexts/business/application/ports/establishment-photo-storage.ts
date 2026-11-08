import type { EstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import type { EstablishmentPhoto } from "../../domain/model/valueobjects/establishment-photo.vo";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type { CommandFileMetadata } from "../../domain/model/commands/business.commands";

/**
 * Transport-neutral establishment photo upload contract. Implementations
 * live in Infrastructure and receive the bytes via the `CommandFileMetadata`
 * shape; Domain/Application never sees `File`/`FormData`.
 */
export interface EstablishmentPhotoStorage {
  upload(
    input: CommandFileMetadata,
    organizationId: OrganizationId,
  ): Promise<EstablishmentPhoto>;
  remove(id: EstablishmentId): Promise<void>;
}
