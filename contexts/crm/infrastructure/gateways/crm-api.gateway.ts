import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { CrmCommandService } from "../../domain/services/crm-command.service";
import { CrmQueryService, PageResponse } from "../../application/services/crm-query.service";
import { RegisterCustomerCommand } from "../../domain/model/commands/register-customer.command";
import { UpdateCustomerCommand } from "../../domain/model/commands/update-customer.command";
import { DeleteCustomerCommand } from "../../domain/model/commands/delete-customer.command";
import { CustomerResponse, ResolvedCustomerData } from "../../domain/model/entities/customer";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class CrmApiGateway implements CrmCommandService, CrmQueryService {
  async registerCustomer(command: RegisterCustomerCommand, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    return apiClient.post<CustomerResponse>(
      "/api/crm/customers",
      command,
      {
        token: authToken,
        errorMessage: "Failed to register customer",
      }
    );
  }

  async updateCustomer(command: UpdateCustomerCommand, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    return apiClient.put<CustomerResponse>(
      `/api/crm/customers/${command.id}`,
      command,
      {
        token: authToken,
        errorMessage: "Failed to update customer",
      }
    );
  }

  async deleteCustomer(command: DeleteCustomerCommand, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);
    return apiClient.delete<void>(
      `/api/crm/customers/${command.id}?establishmentId=${command.establishmentId}`,
      {
        token: authToken,
        errorMessage: "Failed to delete customer",
      }
    );
  }

  async resolveDocument(dni?: string, ruc?: string, token?: string): Promise<ResolvedCustomerData> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();
    if (dni) query.append("dni", dni);
    if (ruc) query.append("ruc", ruc);
    
    return apiClient.post<ResolvedCustomerData>(
      `/api/crm/customers/resolve?${query.toString()}`,
      undefined,
      {
        token: authToken,
        errorMessage: "Failed to resolve identity document",
      }
    );
  }

  async search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number,
    token?: string
  ): Promise<PageResponse<CustomerResponse>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();
    query.append("establishmentId", establishmentId);
    if (search) query.append("search", search);
    query.append("page", String(page ?? 0));
    query.append("size", String(size ?? 20));

    return apiClient.get<PageResponse<CustomerResponse>>(
      `/api/crm/customers?${query.toString()}`,
      {
        token: authToken,
        errorMessage: "Failed to search customers",
      }
    );
  }

  async getCustomer(id: string, establishmentId: string, token?: string): Promise<CustomerResponse> {
    const authToken = await resolveAccessToken(token);
    return apiClient.get<CustomerResponse>(
      `/api/crm/customers/${id}?establishmentId=${establishmentId}`,
      {
        token: authToken,
        errorMessage: "Failed to fetch customer",
      }
    );
  }
}
