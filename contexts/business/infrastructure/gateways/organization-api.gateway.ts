import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { Organization } from "../../domain/model/entities/organization.entity";
import { createOrganizationId } from "../../domain/model/valueobjects/organization-id.vo";
import type {
  OrganizationCommandService,
  OrganizationQueryService,
} from "../../domain/services/business.services";
import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
} from "../../domain/model/commands/business.commands";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

type RawOrganization = {
  id: string;
  ownerId: string;
  name: string;
  active: boolean;
};

function mapOrganizationToEntity(raw: RawOrganization): Organization {
  return Organization.create({
    id: createOrganizationId(raw.id),
    ownerId: raw.ownerId,
    name: raw.name,
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

export class OrganizationApiGateway implements OrganizationCommandService, OrganizationQueryService {
  async getMyOrganization(token?: string): Promise<Organization> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/organizations`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Organization not found for user");
    return mapOrganizationToEntity(await res.json());
  }

  async getById(id: string, token?: string): Promise<Organization> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/organizations/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Organization not found");
    return mapOrganizationToEntity(await res.json());
  }

  async create(command: CreateOrganizationCommand, token?: string): Promise<Organization> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/organizations`, {
      method: "POST",
      headers,
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create organization");
    }

    return mapOrganizationToEntity(await res.json());
  }

  async update(command: UpdateOrganizationCommand, token?: string): Promise<Organization> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/organizations/${command.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name: command.name }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update organization");
    }

    return mapOrganizationToEntity(await res.json());
  }

  async delete(command: DeleteOrganizationCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    const headers: HeadersInit = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${apiBaseUrl}/api/business/organizations/${command.id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to delete organization");
  }
}
