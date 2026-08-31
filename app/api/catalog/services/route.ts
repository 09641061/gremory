import { NextResponse } from "next/server";
import { z } from "zod";
import { createCatalogServiceCommandService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createCatalogServiceReadModel } from "@/contexts/catalog/application/model/catalog-service.read-model";
import { createCatalogServiceSchema } from "@/contexts/catalog/interfaces/rest/schemas/catalog-service.schemas";

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

    const page = await createCatalogServiceQueryService().search({
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
    });

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

function routeErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    const status = readStatus(error);
    if (status !== undefined) {
      const details = readDetails(error);
      return NextResponse.json(
        details === undefined
          ? { message: error.message }
          : { message: error.message, details },
        { status },
      );
    }

    if (error.message === "Authentication is required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}

function readStatus(error: Error): number | undefined {
  const status = (error as Error & { status?: unknown }).status;
  if (typeof status !== "number" || Number.isNaN(status)) return undefined;
  if (status <= 0) return 502;
  return status;
}

function readDetails(error: Error): unknown {
  return (error as Error & { details?: unknown }).details;
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

    const service = await createCatalogServiceCommandService().create({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      preServiceInstructions: parsed.data.preServiceInstructions || null,
      postServiceRecommendations: parsed.data.postServiceRecommendations || null,
    });

    return NextResponse.json(createCatalogServiceReadModel(service), { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
