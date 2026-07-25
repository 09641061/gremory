import "server-only";

import {
  ApiError,
  apiClient,
  type ApiRequestOptions,
} from "@/contexts/shared/infrastructure/http/api-client";

export class BusinessApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "BusinessApiError";
  }
}

type BusinessRequestOptions = Omit<ApiRequestOptions, "errorType">;

export async function businessRequest<T>(path: string, options: BusinessRequestOptions = {}): Promise<T> {
  return apiClient.request<T>(path, {
    ...options,
    errorType: BusinessApiError,
    errorMessage: "Business API request failed",
  });
}

export function businessGet<T>(path: string, token?: string): Promise<T> {
  return businessRequest<T>(path, { method: "GET", token });
}

export function businessPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return businessRequest<T>(path, { method: "POST", body, token });
}

export function businessPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  return businessRequest<T>(path, { method: "PUT", body, token });
}

export function businessDelete(path: string, token?: string): Promise<void> {
  return businessRequest<void>(path, { method: "DELETE", token });
}
