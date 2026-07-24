import "server-only";

import { Establishment } from "../../domain/model/entities/establishment.entity";
import { createEstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentName } from "../../domain/model/valueobjects/establishment-name.vo";
import { createEstablishmentPhoto } from "../../domain/model/valueobjects/establishment-photo.vo";
import type {
  EstablishmentCommandService,
  EstablishmentQueryService,
  PageResponse,
} from "../../domain/services/business.services";
import type {
  CreateEstablishmentCommand,
  UpdateEstablishmentCommand,
  DeleteEstablishmentCommand,
} from "../../domain/model/commands/business.commands";
import type {
  GetEstablishmentByIdQuery,
  ListEstablishmentsByOrganizationQuery,
} from "../../domain/model/queries/business.queries";
import type { EstablishmentResource, PageResource } from "../../interfaces/rest/resources/business.resources";
import { businessDelete, businessGet, businessPost, businessPut } from "../http/business-api.client";
import { getBusinessAccessToken } from "../session/business-session";
import { businessApiConfig } from "../config/business-api.config";

export class EstablishmentApiGateway implements EstablishmentCommandService, EstablishmentQueryService {
  async create(command: CreateEstablishmentCommand, token?: string): Promise<Establishment> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessPost<EstablishmentResource>(businessApiConfig.routes.establishments, command, authToken);
    return toEstablishment(resource);
  }

  async getById(query: GetEstablishmentByIdQuery, token?: string): Promise<Establishment> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessGet<EstablishmentResource>(
      `${businessApiConfig.routes.establishments}/${encodeURIComponent(query.id)}`,
      authToken
    );
    return toEstablishment(resource);
  }

  async getByOrganization(query: ListEstablishmentsByOrganizationQuery, token?: string): Promise<PageResponse<Establishment>>;
  async getByOrganization(organizationId: string, page?: number, size?: number, token?: string): Promise<PageResponse<Establishment>>;
  async getByOrganization(
    queryOrOrganizationId: ListEstablishmentsByOrganizationQuery | string,
    pageOrToken?: number | string,
    size?: number,
    token?: string
  ): Promise<PageResponse<Establishment>> {
    const query: ListEstablishmentsByOrganizationQuery = typeof queryOrOrganizationId === "string"
      ? { organizationId: queryOrOrganizationId, page: pageOrToken as number | undefined, size }
      : queryOrOrganizationId;
    const authToken = await getBusinessAccessToken(
      typeof pageOrToken === "string" ? pageOrToken : token
    );
    const params = new URLSearchParams({
      page: String(query.page ?? 0),
      size: String(query.size ?? 20),
    });
    const resource = await businessGet<PageResource<EstablishmentResource>>(
      `${businessApiConfig.routes.establishments}/organization/${encodeURIComponent(query.organizationId)}?${params}`,
      authToken
    );
    return {
      ...resource,
      content: resource.content.map(toEstablishment),
    };
  }

  async update(command: UpdateEstablishmentCommand, token?: string): Promise<Establishment> {
    const authToken = await getBusinessAccessToken(token);
    const resource = await businessPut<EstablishmentResource>(
      `${businessApiConfig.routes.establishments}/${encodeURIComponent(command.id)}`,
      { name: command.name, photoUrl: command.photoUrl ?? null },
      authToken
    );
    return toEstablishment(resource);
  }

  async delete(command: DeleteEstablishmentCommand, token?: string): Promise<void> {
    const authToken = await getBusinessAccessToken(token);
    await businessDelete(
      `${businessApiConfig.routes.establishments}/${encodeURIComponent(command.id)}`,
      authToken
    );
  }
}

function toEstablishment(resource: EstablishmentResource): Establishment {
  return Establishment.create({
    id: createEstablishmentId(resource.id),
    organizationId: resource.organizationId,
    name: createEstablishmentName(resource.name),
    photoUrl: createEstablishmentPhoto(resource.photoUrl),
    active: true,
  });
}
