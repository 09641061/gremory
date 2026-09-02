import "server-only";

import { apiConfig } from "@/api.config";

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

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  token?: string;
  body?: unknown;
  headers?: HeadersInit;
  errorMessage?: string;
  errorType?: ApiErrorConstructor;
};

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
      body,
      headers: customHeaders,
      errorMessage,
      errorType: ErrorType = ApiError,
      ...requestInit
    } = options;
    const headers = toHeaderRecord(customHeaders);

    if (token && !hasHeader(headers, "authorization")) {
      headers.Authorization = `Bearer ${token}`;
    }

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
  if (!body) return undefined;

  if (Array.isArray(body) && body.length > 0) {
    return extractApiErrorMessage(body[0]);
  }

  if (typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;

  const message = record.message;
  if (typeof message === "string" && message.length > 0) return message;

  const detail = record.detail;
  if (typeof detail === "string" && detail.length > 0) return detail;

  const title = record.title;
  if (typeof title === "string" && title.length > 0) return title;

  return undefined;
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((header) => header.toLowerCase() === name);
}
