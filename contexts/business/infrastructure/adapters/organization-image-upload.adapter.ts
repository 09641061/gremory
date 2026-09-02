import "server-only";

import type { OrganizationImageStorage } from "@/contexts/business/application/services/business.services";
import type { OrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "@/contexts/business/domain/model/valueobjects/organization-name.vo";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { apiConfig } from "@/api.config";

type OrganizationImageUploadResponse = {
  message?: unknown;
  detail?: unknown;
};

export class OrganizationImageUploadAdapter implements OrganizationImageStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(id: OrganizationId, name: OrganizationName, image: File): Promise<void> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("name", name.value);
    formData.set("photoFile", image);

    const response = await fetch(
      `${apiConfig.baseUrl}${apiConfig.routes.organizations}/${encodeURIComponent(id.value)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Organization-Id": id.value,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as OrganizationImageUploadResponse | null;
      const message =
        typeof data?.message === "string" && data.message.trim()
          ? data.message
          : typeof data?.detail === "string" && data.detail.trim()
            ? data.detail
            : "Failed to update organization";
      throw new Error(message);
    }
  }
}

export function createOrganizationImageUploadAdapter(): OrganizationImageStorage {
  return new OrganizationImageUploadAdapter();
}
