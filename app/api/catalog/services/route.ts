import { NextResponse } from "next/server";
import { composeCatalogAdapters } from "@/contexts/catalog/interfaces/server/catalog-composition";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createCatalogServiceReadModel } from "@/contexts/catalog/application/model/catalog-service.read-model";
import { createCatalogServiceSchema } from "@/contexts/catalog/interfaces/rest/schemas/catalog-service.schemas";
import { requireOperationAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";

const activeQuerySchema = z.enum(["true", "false"]).transform((value) => value === "true").optional();
const listQuerySchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  search: z.string().trim().min(1).optional(),
  active: activeQuerySchema,
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minDuration: z.coerce.number().int().min(0).optional(),
  maxDuration: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      establishmentId: url.searchParams.get("establishmentId") ?? undefined,
      categoryId: url.searchParams.get("categoryId") || undefined,
      search: url.searchParams.get("search") || undefined,
      active: url.searchParams.get("active") ?? undefined,
      minPrice: url.searchParams.get("minPrice") ?? undefined,
      maxPrice: url.searchParams.get("maxPrice") ?? undefined,
      minDuration: url.searchParams.get("minDuration") ?? undefined,
      maxDuration: url.searchParams.get("maxDuration") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const auth = await requireOperationAuthorization("catalog:read", parsed.data.establishmentId);
    if (auth.establishmentId !== parsed.data.establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });
    const page = await composeCatalogAdapters().serviceQueryService.search({
      establishmentId: parsed.data.establishmentId,
      categoryId: parsed.data.categoryId,
      search: parsed.data.search,
      active: parsed.data.active,
      minPrice: parsed.data.minPrice,
      maxPrice: parsed.data.maxPrice,
      minDuration: parsed.data.minDuration,
      maxDuration: parsed.data.maxDuration,
      page: parsed.data.page,
      size: parsed.data.size,
    }, auth.token);

    return NextResponse.json(page);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function validationErrorResponse(message?: string) {
  return NextResponse.json(
    { message: message ?? "Invalid request" },
    { status: 400 },
  );
}

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = createCatalogServiceSchema.safeParse({
      establishmentId: (body as { establishmentId?: unknown })?.establishmentId,
      name: (body as { name?: unknown })?.name,
      description: (body as { description?: unknown })?.description,
      price: (body as { price?: unknown })?.price,
      durationMinutes: (body as { durationMinutes?: unknown })?.durationMinutes,
      categoryId: (body as { categoryId?: unknown })?.categoryId || undefined,
      preServiceInstructions: (body as { preServiceInstructions?: unknown })?.preServiceInstructions || undefined,
      postServiceRecommendations: (body as { postServiceRecommendations?: unknown })?.postServiceRecommendations || undefined,
      preparationMinutes: (body as { preparationMinutes?: unknown })?.preparationMinutes ?? 0,
      cleanupMinutes: (body as { cleanupMinutes?: unknown })?.cleanupMinutes ?? 0,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const auth = await requireOperationAuthorization("catalog:manage", parsed.data.establishmentId);
    if (auth.establishmentId !== parsed.data.establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });
    const service = await composeCatalogAdapters().serviceCommandService.create({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      preServiceInstructions: parsed.data.preServiceInstructions || null,
      postServiceRecommendations: parsed.data.postServiceRecommendations || null,
    }, auth.token);

    return NextResponse.json(createCatalogServiceReadModel(service), { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
