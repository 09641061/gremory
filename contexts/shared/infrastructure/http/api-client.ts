import "server-only";

import { apiConfig } from "@/api.config";
import {
  buildApiRequestHeaders,
  type ApiRequestContext,
  type AuthenticatedRequestContext,
} from "./request-context";
import { extractProblemDetailsMessage, type ProblemDetails } from "./problem-details";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

type ApiErrorConstructor = new (
  message: string,
  status: number,
  details?: unknown,
) => ApiError;

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> &
  ApiRequestContext & {
    body?: unknown;
    headers?: HeadersInit;
    errorMessage?: string;
    errorType?: ApiErrorConstructor;
  };

export type { ApiRequestContext, AuthenticatedRequestContext, ProblemDetails };

export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return (await this.requestWithResponse<T>(path, options)).data;
  }

  async requestWithResponse<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      token,
      tenantId,
      body,
      headers: customHeaders,
      errorMessage,
      errorType: ErrorType = ApiError,
      ...requestInit
    } = options;
    const headers = buildApiRequestHeaders({ token, tenantId }, customHeaders);

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (!hasHeader(headers, "content-type")) {
        headers["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(body);
    }

    const init: RequestInit = {
      ...requestInit,
      cache: requestInit.cache ?? "no-store",
    };
    if (Object.keys(headers).length > 0) init.headers = headers;
    if (requestBody !== undefined) init.body = requestBody;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path), init);
    } catch (cause) {
      throw new ErrorType(errorMessage ?? "Unable to connect to the API", 0, cause);
    }

    const responseBody = await readResponseBody(response);
    if (!response.ok) {
      throw new ErrorType(
        extractApiErrorMessage(responseBody) ??
          errorMessage ??
          `API request failed with status ${response.status}`,
        response.status,
        responseBody,
      );
    }

    return {
      data: responseBody as T,
      status: response.status,
      headers: response.headers,
    };
  }

  get<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(apiConfig.baseUrl);

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function extractApiErrorMessage(body: unknown): string | undefined {
  return extractProblemDetailsMessage(body);
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((header) => header.toLowerCase() === name);
}
