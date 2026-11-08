import "server-only";

import type { EstablishmentPhotoStorage } from "@/contexts/business/application/services/business.services";
import type { CommandFileMetadata } from "@/contexts/business/domain/model/commands/business.commands";
import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import type { EstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import type { OrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import {
  createEstablishmentPhoto,
  type EstablishmentPhoto,
} from "@/contexts/business/domain/model/valueobjects/establishment-photo.vo";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { z } from "zod";
import { BusinessApiError } from "../http/business-api.client";

const establishmentPhotoUploadResponseSchema = z
  .object({
    storedPath: z.string().optional(),
    photoUrl: z.string().optional(),
  })
  .strict();

export class EstablishmentPhotoAdapter implements EstablishmentPhotoStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(
    photo: CommandFileMetadata | File,
    organizationId: OrganizationId,
  ): Promise<EstablishmentPhoto> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    if (photo instanceof File) {
      formData.set("file", photo);
    } else {
      const blob = new Blob([photo.bytes.buffer as ArrayBuffer], { type: photo.type });
      formData.set("file", blob, photo.name);
    }

    const raw = await apiClient.requestMultipart<unknown>(apiConfig.routes.establishmentImages, formData, {
      method: "POST",
      token: authToken,
      tenantId: organizationId.value,
      errorMessage: "Failed to upload establishment image",
      errorType: BusinessApiError,
    });
    const data = establishmentPhotoUploadResponseSchema.parse(raw);
    const storedReference = data.photoUrl ?? data.storedPath;
    if (!storedReference) {
      throw new BusinessApiError("Failed to upload establishment image", 502);
    }

    return createEstablishmentPhoto(storedReference);
  }

  async remove(id: EstablishmentId): Promise<void> {
    await new EstablishmentApiGateway(this.providedToken).deletePhoto(id);
  }
}

export function createEstablishmentPhotoAdapter(): EstablishmentPhotoStorage {
  return new EstablishmentPhotoAdapter();
}
