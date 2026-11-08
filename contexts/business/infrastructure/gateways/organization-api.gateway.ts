import "server-only";

import { Organization } from "../../domain/model/entities/organization.entity";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import { createOrganizationName, type OrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import { createOrganizationImage } from "../../domain/model/valueobjects/organization-image.vo";
import type { OrganizationRepository } from "../../domain/services/business.repositories";
import type { CommandFileMetadata } from "../../domain/model/commands/business.commands";
import type { OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type { OrganizationResource } from "../../interfaces/rest/resources/business.resources";
import {
  accessibleOrganizationsSchema,
  type AccessibleOrganizationResource,
} from "../../interfaces/rest/schemas/accessible-organization.schemas";
import {
  BusinessApiError,
  businessGet,
  businessPut,
} from "../http/business-api.client";
import { requireBusinessAccessToken } from "../session/business-session";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { organizationResponseSchema } from "../../interfaces/rest/schemas/organization.schemas";

export class OrganizationApiGateway implements OrganizationRepository {
  constructor(private readonly providedToken?: string) {}

  /** Multipart so the logo can ride the same request as the onboarding form. */
  async create(name: OrganizationName, imageFile?: CommandFileMetadata | null): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("name", name.value);
    if (imageFile) {
      const blob = new Blob([imageFile.bytes.buffer as ArrayBuffer], { type: imageFile.type });
      formData.set("photoFile", blob, imageFile.name);
    }

    const data = await apiClient.requestMultipart<unknown>(
      apiConfig.routes.organizations,
      formData,
      {
        method: "POST",
        token: authToken,
        errorMessage: "Failed to create organization",
        errorType: BusinessApiError,
      },
    );
    return toOrganization(organizationResponseSchema.parse(data));
  }

  async findMine(): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessGet<OrganizationResource>(apiConfig.routes.organizations, authToken);
    return toOrganization(organizationResponseSchema.parse(resource));
  }

  async findAccessible(): Promise<AccessibleOrganizationResource[]> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessGet<unknown>(apiConfig.routes.accessibleOrganizations, authToken);
    return accessibleOrganizationsSchema.parse(resource);
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    try {
      const resource = await businessGet<OrganizationResource>(
        `${apiConfig.routes.organizations}/${encodeURIComponent(id.value)}`,
        authToken,
      );
      return toOrganization(organizationResponseSchema.parse(resource));
    } catch (error) {
      if (error instanceof BusinessApiError && error.status === 404) return null;
      throw error;
    }
  }

  async save(organization: Organization): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessPut<OrganizationResource>(
      `${apiConfig.routes.organizations}/${encodeURIComponent(organization.id.value)}`,
      { name: organization.name.value, imageUrl: organization.imageUrl.value },
      authToken,
      undefined,
      { tenantId: organization.id.value },
    );
    return toOrganization(organizationResponseSchema.parse(resource));
  }
}

function toOrganization(resource: OrganizationResource): Organization {
  return Organization.create({
    id: createOrganizationId(resource.id),
    ownerId: resource.ownerId,
    name: createOrganizationName(resource.name),
    imageUrl: createOrganizationImage(resource.imageUrl),
    active: true,
  });
}
