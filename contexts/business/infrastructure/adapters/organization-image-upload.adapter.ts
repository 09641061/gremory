import "server-only";

import type { OrganizationImageStorage } from "@/contexts/business/application/services/business.services";
import type { CommandFileMetadata } from "@/contexts/business/domain/model/commands/business.commands";
import type { OrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import type { OrganizationName } from "@/contexts/business/domain/model/valueobjects/organization-name.vo";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { z } from "zod";
import { BusinessApiError } from "../http/business-api.client";

/** Backend upload responses are intentionally strict until OpenAPI confirms a richer envelope. */
const organizationImageResponseSchema = z
  .object({
    id: z.string().uuid().optional(),
    message: z.string().optional(),
    detail: z.string().optional(),
  })
  .strict()
  .refine((value) => value.id || value.message || value.detail, {
    message: "Organization upload response is empty",
  });

export class OrganizationImageUploadAdapter implements OrganizationImageStorage {
  constructor(private readonly providedToken?: string) {}

  async upload(
    id: OrganizationId,
    name: OrganizationName,
    image: CommandFileMetadata | File,
  ): Promise<void> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("name", name.value);
    if (image instanceof File) {
      formData.set("photoFile", image);
    } else {
      const blob = new Blob([image.bytes.buffer as ArrayBuffer], { type: image.type });
      formData.set("photoFile", blob, image.name);
    }

    const data = await apiClient.requestMultipart<unknown>(
      `${apiConfig.routes.organizations}/${encodeURIComponent(id.value)}`,
      formData,
      {
        method: "PUT",
        token: authToken,
        tenantId: id.value,
        errorMessage: "Failed to update organization",
        errorType: BusinessApiError,
      },
    );
    organizationImageResponseSchema.parse(data);
  }
}

export function createOrganizationImageUploadAdapter(): OrganizationImageStorage {
  return new OrganizationImageUploadAdapter();
}
