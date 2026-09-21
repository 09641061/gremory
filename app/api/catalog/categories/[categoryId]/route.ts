import { NextResponse } from "next/server";
import { composeCatalogAdapters } from "@/contexts/catalog/interfaces/server/catalog-composition";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createServiceCategoryReadModel } from "@/contexts/catalog/application/model/service-category.read-model";
import { requireCatalogCategoryTargetAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";
import { updateServiceCategorySchema } from "@/contexts/catalog/interfaces/rest/schemas/service-category.schemas";

const uuidSchema = z.string().uuid();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    const idParsed = uuidSchema.safeParse(categoryId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const body = await parseJsonBody(request);
    const parsed = updateServiceCategorySchema.safeParse({
      id: idParsed.data,
      name: (body as { name?: unknown })?.name,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const auth = await requireCatalogCategoryTargetAuthorization(idParsed.data);
    const category = await composeCatalogAdapters().categoryCommandService.update(parsed.data, auth.token);

    return NextResponse.json(createServiceCategoryReadModel(category));
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    const idParsed = uuidSchema.safeParse(categoryId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const auth = await requireCatalogCategoryTargetAuthorization(idParsed.data);
    await composeCatalogAdapters().categoryCommandService.delete({ id: idParsed.data }, auth.token);

    return new Response(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
