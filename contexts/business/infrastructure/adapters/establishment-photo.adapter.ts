import "server-only";

import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import { createEstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import { apiConfig } from "@/api.config";

type EstablishmentPhotoUploadResponse = {
  message?: string;
  storedPath?: string;
  photoUrl?: string;
};

export class EstablishmentPhotoAdapter {
  async upload(file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.routes.establishmentImages}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as EstablishmentPhotoUploadResponse | null;

    if (!response.ok) {
      throw new Error(
        (data?.message ? String(data.message) : "") || "Failed to upload establishment image",
      );
    }

    if (!data?.photoUrl && !data?.storedPath) {
      throw new Error("Failed to upload establishment image");
    }

    return data.photoUrl ?? data.storedPath ?? "";
  }

  async delete(establishmentId: string, token: string): Promise<void> {
    await new EstablishmentApiGateway(token).deletePhoto(createEstablishmentId(establishmentId));
  }
}

export function createEstablishmentPhotoAdapter() {
  return new EstablishmentPhotoAdapter();
}
