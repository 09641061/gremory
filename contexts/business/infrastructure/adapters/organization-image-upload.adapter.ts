import "server-only";

import type { OrganizationImageStorage } from "@/contexts/business/application/services/business.services";
import type { OrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "@/contexts/business/domain/model/valueobjects/organization-name.vo";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { z } from "zod";

const organizationImageResponseSchema = z.object({ message: z.unknown().optional(), detail: z.unknown().optional() }).passthrough();

export class OrganizationImageUploadAdapter implements OrganizationImageStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(id: OrganizationId, name: OrganizationName, image: File): Promise<void> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("name", name.value);
    formData.set("photoFile", image);

    const data = await apiClient.requestMultipart<unknown>(`${apiConfig.routes.organizations}/${encodeURIComponent(id.value)}`, formData, {
      method: "PUT", token: authToken, tenantId: id.value, errorMessage: "Failed to update organization",
    });
    organizationImageResponseSchema.parse(data);
  }
}

export function createOrganizationImageUploadAdapter(): OrganizationImageStorage {
  return new OrganizationImageUploadAdapter();
}
