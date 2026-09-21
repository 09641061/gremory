import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { CrmCommandPort } from "../../application/ports/crm-command.port";
import type { CrmQueryPort } from "../../application/ports/crm-query.port";
import type { RegisterCustomerCommand, UpdateCustomerCommand, DeleteCustomerCommand } from "../../application/models/commands";
import type { CustomerResponse, ResolvedCustomerData } from "../../application/models/customer";
import type { PageResponse } from "../../application/services/crm-query.service";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import {
  customerPageResponseSchema,
  customerSchema,
  resolvedIdentitySchema,
} from "../contracts/crm.schemas";

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class CrmApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown, options?: ErrorOptions) {
    super(message, status, details, options);
    this.name = "CrmApiError";
  }
}

export class CrmApiGateway implements CrmCommandPort, CrmQueryPort {
  constructor(private readonly organizationId?: string) {}

  private tenantOptions(): { tenantId?: string } {
    return { tenantId: this.organizationId };
  }

  async registerCustomer(command: RegisterCustomerCommand, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.post<unknown>(
      "/api/crm/customers",
      command,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to register customer",
        errorType: CrmApiError,
      },
    );
    return parseProviderResponse(customerSchema, response, "customer");
  }

  async updateCustomer(command: UpdateCustomerCommand, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.put<unknown>(
      `/api/crm/customers/${encodeURIComponent(command.id)}`,
      command,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to update customer",
        errorType: CrmApiError,
      },
    );
    return parseProviderResponse(customerSchema, response, "customer");
  }

  async deleteCustomer(command: DeleteCustomerCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.delete<void>(
      `/api/crm/customers/${encodeURIComponent(command.id)}?establishmentId=${encodeURIComponent(command.establishmentId)}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to delete customer",
        errorType: CrmApiError,
      },
    );
  }

  async resolveDocument(
    establishmentId: string,
    dni?: string,
    ruc?: string,
    token?: string,
  ): Promise<ResolvedCustomerData> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();
    query.append("establishmentId", establishmentId);
    if (dni) query.append("dni", dni);
    if (ruc) query.append("ruc", ruc);

    const response = await apiClient.post<unknown>(
      `/api/crm/customers/resolve?${query.toString()}`,
      undefined,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to resolve identity document",
        errorType: CrmApiError,
      },
    );
    return parseProviderResponse(resolvedIdentitySchema, response, "resolved identity");
  }

  async search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number,
    token?: string,
  ): Promise<PageResponse<CustomerResponse>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();
    query.append("establishmentId", establishmentId);
    if (search) query.append("search", search);
    const safePage = Number.isInteger(page) && (page as number) >= 0 ? Math.min(page as number, 10_000) : 0;
    const safeSize = Number.isInteger(size) && (size as number) > 0 ? Math.min(size as number, 100) : 20;
    query.append("page", String(safePage));
    query.append("size", String(safeSize));

    const response = await apiClient.get<unknown>(
      `/api/crm/customers?${query.toString()}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to search customers",
        errorType: CrmApiError,
      },
    );
    return parseProviderResponse(customerPageResponseSchema, response, "customer page");
  }

  async getCustomer(id: string, establishmentId: string, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.get<unknown>(
      `/api/crm/customers/${encodeURIComponent(id)}?establishmentId=${encodeURIComponent(establishmentId)}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to fetch customer",
        errorType: CrmApiError,
      },
    );
    return parseProviderResponse(customerSchema, response, "customer");
  }
}

function parseProviderResponse<T extends import("zod").ZodTypeAny>(
  schema: T,
  response: unknown,
  resource: string,
): import("zod").infer<T> {
  try {
    return schema.parse(response);
  } catch (cause) {
    throw new CrmApiError(`Invalid CRM ${resource} response`, 502, undefined, { cause });
  }
}
