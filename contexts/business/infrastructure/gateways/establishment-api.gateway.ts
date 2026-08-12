import "server-only";

import { Establishment } from "../../domain/model/entities/establishment.entity";
import { createEstablishmentId, type EstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName, type EstablishmentName } from "../../domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto, type EstablishmentPhoto } from "../../domain/model/valueobjects/establishment-photo.vo";
import { createOrganizationId, type OrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type {
  EstablishmentRepository,
  PageResult,
} from "../../domain/services/business.repositories";
import type { EstablishmentResource, PageResource } from "../../interfaces/rest/resources/business.resources";
import {
  BusinessApiError,
  businessDelete,
  businessGet,
  businessPost,
  businessPut,
} from "../http/business-api.client";
import { requireBusinessAccessToken } from "../session/business-session";
import { apiConfig } from "@/api.config";

export class EstablishmentApiGateway implements EstablishmentRepository {
  constructor(private readonly providedToken?: string) {}

  async create(
    organizationId: OrganizationId,
    name: EstablishmentName,
    photoUrl: EstablishmentPhoto,
    timeZone: string,
  ): Promise<Establishment> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessPost<EstablishmentResource>(
      apiConfig.routes.establishments,
      {
        organizationId: organizationId.value,
        name: name.value,
        photoUrl: photoUrl.value,
        timeZone,
      },
      authToken,
    );
    return toEstablishment(resource);
  }

  async findById(id: EstablishmentId): Promise<Establishment | null> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    try {
      const resource = await businessGet<EstablishmentResource>(
        `${apiConfig.routes.establishments}/${encodeURIComponent(id.value)}`,
        authToken
      );
      return toEstablishment(resource);
    } catch (error) {
      if (error instanceof BusinessApiError && error.status === 404) return null;
      throw error;
    }
  }

  async findByOrganization(
    organizationId: OrganizationId,
    page: number,
    size: number,
  ): Promise<PageResult<Establishment>> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    const resource = await businessGet<PageResource<EstablishmentResource>>(
      `${apiConfig.routes.establishments}/organization/${encodeURIComponent(organizationId.value)}?${params}`,
      authToken
    );
    return {
      ...resource,
      content: resource.content.map(toEstablishment),
    };
  }

  async save(establishment: Establishment): Promise<Establishment> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    const resource = await businessPut<EstablishmentResource>(
      `${apiConfig.routes.establishments}/${encodeURIComponent(establishment.id.value)}`,
      {
        name: establishment.name.value,
        photoUrl: establishment.photoUrl.value,
        timeZone: establishment.timeZone,
      },
      authToken
    );
    return toEstablishment(resource);
  }

  async deletePhoto(id: EstablishmentId): Promise<void> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    await businessDelete(
      `${apiConfig.routes.establishments}/${encodeURIComponent(id.value)}/photo`,
      authToken,
    );
  }

  async delete(id: EstablishmentId): Promise<void> {
    const authToken = await requireBusinessAccessToken(this.providedToken);
    await businessDelete(
      `${apiConfig.routes.establishments}/${encodeURIComponent(id.value)}`,
      authToken
    );
  }
}

function toEstablishment(resource: EstablishmentResource): Establishment {
  return Establishment.create({
    id: createEstablishmentId(resource.id),
    organizationId: createOrganizationId(resource.organizationId),
    name: createEstablishmentName(resource.name),
    photoUrl: createEstablishmentPhoto(resource.photoUrl),
    timeZone: resource.timeZone ?? "UTC",
    active: true,
  });
}
