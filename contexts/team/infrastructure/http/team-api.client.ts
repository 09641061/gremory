import "server-only";

import {
  ApiError,
  apiClient,
  type ApiRequestOptions,
} from "@/contexts/shared/infrastructure/http/api-client";

export class TeamApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "TeamApiError";
  }
}

type TeamRequestOptions = Omit<ApiRequestOptions, "errorType">;

export function teamRequest<T>(
  path: string,
  options: TeamRequestOptions = {},
): Promise<T> {
  return apiClient.request<T>(path, {
    ...options,
    errorType: TeamApiError,
    errorMessage: "Team API request failed",
  });
}

export function teamGet<T>(path: string, token?: string): Promise<T> {
  return teamRequest<T>(path, { method: "GET", token });
}

export function teamPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return teamRequest<T>(path, { method: "POST", body, token });
}

export function teamDelete(path: string, token: string): Promise<void> {
  return teamRequest<void>(path, { method: "DELETE", token });
}
