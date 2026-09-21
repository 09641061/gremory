import "server-only";

import {
  ApiError,
  apiClient,
  type ApiRequestOptions,
} from "@/contexts/shared/infrastructure/http/api-client";
import type { RequestContext } from "@/contexts/shared/infrastructure/http/request-context";

export class BusinessApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "BusinessApiError";
  }
}

type BusinessRequestOptions = Omit<ApiRequestOptions, "errorType">;
type BusinessContext = Pick<RequestContext, "tenantId" | "correlationId" | "signal" | "timeoutMs">;

export async function businessRequest<T>(path: string, options: BusinessRequestOptions = {}): Promise<T> {
  return apiClient.request<T>(path, {
    ...options,
    errorType: BusinessApiError,
    errorMessage: "Business API request failed",
  });
}

export function businessGet<T>(
  path: string,
  token?: string,
  headers?: HeadersInit,
  context: BusinessContext = {},
): Promise<T> {
  return businessRequest<T>(path, { method: "GET", token, headers, ...context });
}

export function businessPost<T>(
  path: string,
  body: unknown,
  token?: string,
  headers?: HeadersInit,
  context: BusinessContext = {},
): Promise<T> {
  return businessRequest<T>(path, { method: "POST", body, token, headers, ...context });
}

export function businessPut<T>(
  path: string,
  body: unknown,
  token?: string,
  headers?: HeadersInit,
  context: BusinessContext = {},
): Promise<T> {
  return businessRequest<T>(path, { method: "PUT", body, token, headers, ...context });
}

export function businessDelete(
  path: string,
  token?: string,
  headers?: HeadersInit,
  context: BusinessContext = {},
): Promise<void> {
  return businessRequest<void>(path, { method: "DELETE", token, headers, ...context });
}
