import { NextResponse } from "next/server";
import { composeCatalogAdapters } from "@/contexts/catalog/interfaces/server/catalog-composition";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createServiceCategoryReadModel } from "@/contexts/catalog/application/model/service-category.read-model";
import { requireCatalogContext } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";
import { createServiceCategorySchema } from "@/contexts/catalog/interfaces/rest/schemas/service-category.schemas";

const listQuerySchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      establishmentId: url.searchParams.get("establishmentId") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const auth = await requireCatalogContext("catalog:read", parsed.data.establishmentId);
    if (auth.establishmentId !== parsed.data.establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });
    const page = await composeCatalogAdapters().categoryQueryService.list(
      parsed.data.establishmentId,
      parsed.data.page,
      parsed.data.size,
      auth.token,
    );

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
    const parsed = createServiceCategorySchema.safeParse({
      establishmentId: (body as { establishmentId?: unknown })?.establishmentId,
      name: (body as { name?: unknown })?.name,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const auth = await requireCatalogContext("catalog:manage", parsed.data.establishmentId);
    if (auth.establishmentId !== parsed.data.establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });
    const category = await composeCatalogAdapters().categoryCommandService.create(parsed.data, auth.token);

    return NextResponse.json(createServiceCategoryReadModel(category), { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
