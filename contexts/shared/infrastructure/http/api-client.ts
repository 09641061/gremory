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
  options?: ErrorOptions,
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
    // Gateways own API paths. Accepting arbitrary absolute URLs here turns a
    // credential-bearing server adapter into an SSRF primitive.
    if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("\\\\")) {
      throw new TypeError("API paths must be relative");
    }
    return `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async requestMultipart<T = unknown>(path: string, formData: FormData, options: Omit<ApiRequestOptions, "body"> = {}): Promise<T> {
    const { token, tenantId, correlationId, signal: contextSignal, timeoutMs, headers: customHeaders, errorMessage, errorType: ErrorType = ApiError, ...requestInit } = options;
    const headers = buildApiRequestHeaders({ token, tenantId, correlationId: correlationId ?? createCorrelationId() }, customHeaders);
    const { signal, cancel } = createDeadlineSignal(contextSignal, timeoutMs ?? 30_000);
    try {
      const response = await fetch(this.buildUrl(path), { ...requestInit, method: requestInit.method ?? "POST", cache: requestInit.cache ?? "no-store", headers, body: formData, signal });
      const responseBody = await readResponseBody(response);
      if (!response.ok) throw new ErrorType(extractApiErrorMessage(responseBody) ?? errorMessage ?? "Multipart request failed", response.status, undefined);
      return responseBody as T;
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      throw new ErrorType(errorMessage ?? (signal.aborted ? "The upload timed out or was cancelled" : "Unable to connect to the API"), signal.aborted ? 504 : 0, undefined, { cause });
    } finally { cancel(); }
  }

  async requestStream(path: string, options: ApiRequestOptions = {}): Promise<Response> {
    const { token, tenantId, correlationId, signal: contextSignal, timeoutMs, headers: customHeaders, body, ...requestInit } = options;
    const headers = buildApiRequestHeaders({ token, tenantId, correlationId: correlationId ?? createCorrelationId() }, customHeaders);
    if (body !== undefined && !hasHeader(headers, "content-type")) headers["Content-Type"] = "application/json";
    const { signal, cancel } = createDeadlineSignal(contextSignal, timeoutMs ?? 60_000);
    try {
      const response = await fetch(this.buildUrl(path), {
        ...requestInit, method: requestInit.method ?? "GET", cache: requestInit.cache ?? "no-store", headers,
        body: body === undefined ? undefined : JSON.stringify(body), signal,
      });
      if (!response.ok) {
        const responseBody = await readResponseBody(response);
        throw new ApiError(extractApiErrorMessage(responseBody) ?? "Unable to start stream", response.status);
      }
      if (!response.body) { cancel(); return response; }
      const cleanup = () => cancel();
      const transformed = response.body.pipeThrough(new TransformStream({ flush: cleanup }));
      return new Response(transformed, { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      throw new ApiError(signal.aborted ? "The stream timed out or was cancelled" : "Unable to connect to the API", signal.aborted ? 504 : 0, undefined, { cause });
    } finally {
      // A successful body owns the deadline until its reader closes/cancels;
      // errors before headers release it here.
    }
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
      correlationId,
      signal: contextSignal,
      timeoutMs,
      body,
      headers: customHeaders,
      errorMessage,
      errorType: ErrorType = ApiError,
      ...requestInit
    } = options;
    const correlation = correlationId ?? createCorrelationId();
    const headers = buildApiRequestHeaders({ token, tenantId, correlationId: correlation }, customHeaders);

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (!hasHeader(headers, "content-type")) {
        headers["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(body);
    }

    const timeout = timeoutMs ?? 15_000;
    const { signal, cancel } = createDeadlineSignal(contextSignal, timeout);
    const init: RequestInit = {
      ...requestInit,
      cache: requestInit.cache ?? "no-store",
      signal,
    };
    if (Object.keys(headers).length > 0) init.headers = headers;
    if (requestBody !== undefined) init.body = requestBody;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path), init);
    } catch (cause) {
      throw new ErrorType(
        errorMessage ?? (signal.aborted ? "The API request timed out or was cancelled" : "Unable to connect to the API"),
        signal.aborted ? 504 : 0,
        undefined,
        { cause },
      );
    } finally {
      cancel();
    }

    const responseBody = await readResponseBody(response);
    if (!response.ok) {
      throw new ErrorType(
        extractApiErrorMessage(responseBody) ??
          errorMessage ??
          `API request failed with status ${response.status}`,
        response.status,
        undefined,
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

export function createCorrelationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createDeadlineSignal(parent: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  const abort = () => controller.abort(parent?.reason);
  parent?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cancel: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", abort);
    },
  };
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((header) => header.toLowerCase() === name);
}
