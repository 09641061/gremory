import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { Appointment } from "../../domain/model/entities/appointment";
import { CreateAppointmentCommand } from "../../domain/model/commands/create-appointment.command";
import { RescheduleAppointmentCommand } from "../../domain/model/commands/reschedule-appointment.command";
import { CancelAppointmentCommand } from "../../domain/model/commands/cancel-appointment.command";
import { SearchAppointmentsQuery } from "../../domain/model/queries/search-appointments.query";
import { SchedulingCommandService } from "../../application/services/scheduling-command.service";
import { SchedulingQueryService } from "../../application/services/scheduling-query.service";
import { PageResponse } from "../../application/model/page-response";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export class SchedulingApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "SchedulingApiError";
  }
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

export class SchedulingApiGateway
  implements SchedulingCommandService, SchedulingQueryService
{
  constructor(private readonly organizationId?: string) {}

  private tenantHeaders() {
    return this.organizationId ? { "X-Organization-Id": this.organizationId } : undefined;
  }

  async createAppointment(
    command: CreateAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.post<Appointment>(
      apiConfig.routes.scheduling.appointments,
      command,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to create appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async getAppointment(
    id: string,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.get<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Appointment not found",
        errorType: SchedulingApiError,
      }
    );
  }

  async searchAppointments(
    query: SearchAppointmentsQuery,
    token?: string
  ): Promise<PageResponse<Appointment>> {
    const authToken = await resolveAccessToken(token);
    const params = new URLSearchParams();
    params.append("from", query.from);
    params.append("to", query.to);
    if (query.employeeId) params.append("employeeId", query.employeeId);
    if (query.establishmentId) params.append("establishmentId", query.establishmentId);
    if (query.status) params.append("status", query.status);
    params.append("page", String(query.page ?? 0));
    params.append("size", String(query.size ?? 100));

    return apiClient.get<PageResponse<Appointment>>(
      `${apiConfig.routes.scheduling.appointments}?${params.toString()}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to fetch appointments",
        errorType: SchedulingApiError,
      }
    );
  }

  async deleteAppointment(
    id: string,
    token?: string
  ): Promise<void> {
    const authToken = await resolveAccessToken(token);
    return apiClient.delete<void>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to delete appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async rescheduleAppointment(
    id: string,
    command: RescheduleAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}/reschedule`,
      command,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to reschedule appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async updateAppointment(
    id: string,
    command: { title: string; serviceId: string; customerId: string; employeeId: string; startsAt: string; endsAt: string },
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}`,
      command,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to update appointment details",
        errorType: SchedulingApiError,
      }
    );
  }

  async cancelAppointment(
    id: string,
    command: CancelAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}/cancel`,
      command,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to cancel appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async completeAppointment(
    id: string,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}/complete`,
      {},
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to complete appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async startAppointment(
    id: string,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}/start`,
      {},
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to start appointment",
        errorType: SchedulingApiError,
      }
    );
  }

  async markNoShowAppointment(
    id: string,
    token?: string
  ): Promise<Appointment> {
    const authToken = await resolveAccessToken(token);
    return apiClient.patch<Appointment>(
      `${apiConfig.routes.scheduling.appointments}/${encodeURIComponent(id)}/no-show`,
      {},
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to mark appointment as no-show",
        errorType: SchedulingApiError,
      }
    );
  }

  async getSchedulingEmployees(
    establishmentId: string,
    token?: string
  ): Promise<{ userId: string; name: string; imageUrl: string | null; isOwner: boolean; availableForScheduling: boolean; visibleForScheduling: boolean }[]> {
    const authToken = await resolveAccessToken(token);
    return apiClient.get<{ userId: string; name: string; imageUrl: string | null; isOwner: boolean; availableForScheduling: boolean; visibleForScheduling: boolean }[]>(
      `${apiConfig.routes.scheduling.appointments}/employees?establishmentId=${encodeURIComponent(establishmentId)}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to fetch scheduling employees",
        errorType: SchedulingApiError,
      }
    );
  }

  async updateEmployeeVisibility(
    userId: string,
    establishmentId: string,
    visible: boolean,
    token?: string,
  ): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.put<void>(
      `${apiConfig.routes.scheduling.appointments}/employees/${encodeURIComponent(userId)}/visibility?establishmentId=${encodeURIComponent(establishmentId)}&visible=${visible ? "true" : "false"}`,
      undefined,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to update scheduling visibility",
        errorType: SchedulingApiError,
      },
    );
  }

  async updateEmployeeAvailability(
    userId: string,
    establishmentId: string,
    available: boolean,
    token?: string,
  ): Promise<void> {
    const authToken = await resolveAccessToken(token);
    await apiClient.put<void>(
      `${apiConfig.routes.scheduling.appointments}/employees/${encodeURIComponent(userId)}/availability?establishmentId=${encodeURIComponent(establishmentId)}&available=${available ? "true" : "false"}`,
      undefined,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to update employee availability",
        errorType: SchedulingApiError,
      },
    );
  }

  async getSchedulingServices(
    establishmentId: string,
    token?: string
  ): Promise<{ id: string; name: string; price: number; durationMinutes: number }[]> {
    const authToken = await resolveAccessToken(token);
    return apiClient.get<{ id: string; name: string; price: number; durationMinutes: number }[]>(
      `${apiConfig.routes.scheduling.appointments}/services?establishmentId=${encodeURIComponent(establishmentId)}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to fetch scheduling services",
        errorType: SchedulingApiError,
      }
    );
  }

  async getSchedulingCustomers(
    establishmentId: string,
    search?: string,
    token?: string
  ): Promise<{ id: string; name: string; email: string | null; phone: string | null }[]> {
    const authToken = await resolveAccessToken(token);
    const params = new URLSearchParams();
    params.append("establishmentId", establishmentId);
    if (search) params.append("search", search);
    return apiClient.get<{ id: string; name: string; email: string | null; phone: string | null }[]>(
      `${apiConfig.routes.scheduling.appointments}/customers?${params.toString()}`,
      {
        token: authToken,
        headers: this.tenantHeaders(),
        errorMessage: "Failed to fetch scheduling customers",
        errorType: SchedulingApiError,
      }
    );
  }
}
