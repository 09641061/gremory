import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { Establishment } from "../../domain/model/entities/establishment.entity";
import { createEstablishmentId } from "../../domain/model/valueobjects/establishment-id.vo";
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

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

type RawEstablishment = {
  id: string;
  organizationId: string;
  name: string;
  photoUrl?: string | null;
  active: boolean;
};

function mapEstablishmentToEntity(raw: RawEstablishment): Establishment {
  return Establishment.create({
    id: createEstablishmentId(raw.id),
    organizationId: raw.organizationId,
    name: raw.name,
    photoUrl: raw.photoUrl ?? null,
    active: raw.active,
  });
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class EstablishmentApiGateway implements EstablishmentCommandService, EstablishmentQueryService {
  async getByOrganization(
    organizationId: string,
    page = 0,
    size = 20,
    token?: string
  ): Promise<PageResponse<Establishment>> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(
      `${apiBaseUrl}/api/business/establishments/organization/${organizationId}?page=${page}&size=${size}`,
      { headers, cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch establishments for organization");

    const data: PageResponse<RawEstablishment> = await res.json();
    return {
      ...data,
      content: data.content.map(mapEstablishmentToEntity),
    };
  }

  async getById(id: string, token?: string): Promise<Establishment> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/establishments/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Establishment not found");
    return mapEstablishmentToEntity(await res.json());
  }

  async create(command: CreateEstablishmentCommand, token?: string): Promise<Establishment> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/establishments`, {
      method: "POST",
      headers,
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create establishment");
    }

    return mapEstablishmentToEntity(await res.json());
  }

  async update(command: UpdateEstablishmentCommand, token?: string): Promise<Establishment> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const { id, ...payload } = command;
    const res = await fetch(`${apiBaseUrl}/api/business/establishments/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update establishment");
    }

    return mapEstablishmentToEntity(await res.json());
  }

  async delete(command: DeleteEstablishmentCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/establishments/${command.id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to delete establishment");
  }
}
