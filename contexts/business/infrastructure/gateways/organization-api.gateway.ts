import "server-only";

import { Organization } from "../../domain/model/entities/organization.entity";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import { createOrganizationName, type OrganizationName } from "../../domain/model/valueobjects/organization-name.vo";
import { createOrganizationImage } from "../../domain/model/valueobjects/organization-image.vo";
import type { OrganizationRepository } from "../../domain/services/business.repositories";
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

type OrganizationCreateResponse = OrganizationResource & { message?: string };

export class OrganizationApiGateway implements OrganizationRepository {
  constructor(private readonly providedToken?: string) {}

  /** Multipart so the logo can ride the same request as the onboarding form. */
  async create(name: OrganizationName, imageFile?: File | null): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const formData = new FormData();
    formData.set("name", name.value);
    if (imageFile) formData.set("photoFile", imageFile);

    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.routes.organizations}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as OrganizationCreateResponse | null;
    if (!response.ok) {
      throw new BusinessApiError(
        data?.message || "Failed to create organization",
        response.status,
        data,
      );
    }

    return toOrganization(data as OrganizationResource);
  }

  async findMine(): Promise<Organization> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessGet<OrganizationResource>(apiConfig.routes.organizations, authToken);
    return toOrganization(resource);
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
        authToken
      );
      return toOrganization(resource);
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
      authToken
    );
    return toOrganization(resource);
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
