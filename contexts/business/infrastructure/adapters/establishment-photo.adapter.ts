import "server-only";

import type { EstablishmentPhotoStorage } from "@/contexts/business/application/services/business.services";
import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import type { EstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import {
  createEstablishmentPhoto,
  type EstablishmentPhoto,
} from "@/contexts/business/domain/model/valueobjects/establishment-photo.vo";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { apiConfig } from "@/api.config";

type EstablishmentPhotoUploadResponse = {
  message?: string;
  storedPath?: string;
  photoUrl?: string;
};

export class EstablishmentPhotoAdapter implements EstablishmentPhotoStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(photo: File): Promise<EstablishmentPhoto> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("file", photo);

    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.routes.establishmentImages}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as EstablishmentPhotoUploadResponse | null;

    if (!response.ok) {
      throw new Error(
        (data?.message ? String(data.message) : "") || "Failed to upload establishment image",
      );
    }

    const storedReference = data?.photoUrl ?? data?.storedPath;
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
