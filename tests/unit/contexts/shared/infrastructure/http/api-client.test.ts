import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient, ApiError } from "@/contexts/shared/infrastructure/http/api-client";

describe("ApiClient error responses", () => {
  const client = new ApiClient("https://api.example.test");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps supporting legacy message responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ timestamp: "2026-08-26T12:00:00Z", status: 400, message: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = client.get("/users");

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid email",
      status: 400,
    });
  });

  it("prefers legacy message over ProblemDetail detail and title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Legacy message",
          detail: "Problem detail",
          title: "Problem title",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(client.get("/users")).rejects.toMatchObject({
      message: "Legacy message",
      status: 400,
    });
  });

  it("skips empty message and detail values before using title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ message: "", detail: "", title: "Problem title" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(client.get("/users")).rejects.toMatchObject({
      message: "Problem title",
      status: 400,
    });
  });

  it("prefers ProblemDetail detail over title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: "Category with id X does not exist",
          instance: "/api/catalog/categories/X",
          timestamp: "2026-08-26T12:00:00Z",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(client.get("/categories/X")).rejects.toMatchObject({
      message: "Category with id X does not exist",
      status: 404,
    });
  });

  it("falls back to ProblemDetail title when detail is absent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "about:blank",
          title: "Conflict",
          status: 409,
          instance: "/api/catalog/categories",
          timestamp: "2026-08-26T12:00:00Z",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(client.post("/categories", { name: "Existing" })).rejects.toMatchObject({
      message: "Conflict",
      status: 409,
    });
  });

  it("uses the configured error message for unrecognized error bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({}), { status: 422 }));

    await expect(client.get("/users", { errorMessage: "Unable to load users" })).rejects.toMatchObject({
      message: "Unable to load users",
      status: 422,
    });
  });

  it("uses the status fallback for unrecognized non-JSON error bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not json", { status: 502 }));

    await expect(client.get("/users")).rejects.toMatchObject({
      message: "API request failed with status 502",
      status: 502,
    });
  });

  it.each([204, 205])("returns undefined data for a %s response", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status }));

    const response = await client.requestWithResponse<undefined>("/users/current", {
      method: "DELETE",
    });

    expect(response.status).toBe(status);
    expect(response.data).toBeUndefined();
  });

  it("throws ApiError instances", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ title: "Unavailable" }), { status: 503 }));

    await expect(client.get("/users")).rejects.toBeInstanceOf(ApiError);
  });
});
