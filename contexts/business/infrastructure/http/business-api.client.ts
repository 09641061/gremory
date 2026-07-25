import "server-only";

import { businessApiConfig } from "../config/business-api.config";

export class BusinessApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "BusinessApiError";
  }
}

type BusinessRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  token?: string;
  body?: unknown;
  headers?: HeadersInit;
};

export async function businessRequest<T>(path: string, options: BusinessRequestOptions = {}): Promise<T> {
  const { token, body, headers: customHeaders, ...requestInit } = options;
  const headers = new Headers(customHeaders);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${businessApiConfig.baseUrl}${path}`, {
    ...requestInit,
    headers: Object.fromEntries(headers.entries()),
    body: requestBody,
    // Business reads are scoped to the authenticated user. Keep them dynamic;
    // Cache Components still provides PPR through the route Suspense boundaries.
    cache: "no-store",
  });

  const responseBody = await readBody(response);
  if (!response.ok) {
    throw new BusinessApiError(
      extractMessage(responseBody) ?? `Business API request failed with status ${response.status}`,
      response.status,
      responseBody
    );
  }

  return responseBody as T;
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

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  return response.json().catch(() => undefined);
}

function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;
  return typeof record.message === "string" ? record.message : undefined;
}
