import "server-only";

import type { EstablishmentPhotoStorage } from "@/contexts/business/application/services/business.services";
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

const establishmentPhotoUploadResponseSchema = z.object({ storedPath: z.string().optional(), photoUrl: z.string().optional() }).passthrough();

export class EstablishmentPhotoAdapter implements EstablishmentPhotoStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(photo: File, organizationId: OrganizationId): Promise<EstablishmentPhoto> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("file", photo);

    const raw = await apiClient.requestMultipart<unknown>(apiConfig.routes.establishmentImages, formData, {
      method: "POST", token: authToken, tenantId: organizationId.value, errorMessage: "Failed to upload establishment image",
    });
    const data = establishmentPhotoUploadResponseSchema.parse(raw);
    const storedReference = data.photoUrl ?? data.storedPath;
    if (!storedReference) {
      throw new Error("Failed to upload establishment image");
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
