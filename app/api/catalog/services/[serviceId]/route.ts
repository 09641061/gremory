import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createCatalogServiceCommandService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createCatalogServiceReadModel } from "@/contexts/catalog/application/model/catalog-service.read-model";
import { updateCatalogServiceSchema } from "@/contexts/catalog/interfaces/rest/schemas/catalog-service.schemas";
import { requireCatalogServiceTargetAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";

const uuidSchema = z.string().uuid();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const { serviceId } = await params;
    const idParsed = uuidSchema.safeParse(serviceId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const url = new URL(request.url);
    const establishmentId = url.searchParams.get("establishmentId");
    if (!establishmentId) {
      return validationErrorResponse("establishmentId is required");
    }

    const auth = await requireCatalogServiceTargetAuthorization(idParsed.data, "catalog:read", establishmentId);
    const service = await createCatalogServiceQueryService(auth.organizationId).getById(
      idParsed.data,
      establishmentId,
      auth.token,
    );

    return NextResponse.json(service);
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const { serviceId } = await params;
    const idParsed = uuidSchema.safeParse(serviceId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const url = new URL(request.url);
    const establishmentId = url.searchParams.get("establishmentId");
    if (!establishmentId) return validationErrorResponse("establishmentId is required");
    const auth = await requireCatalogServiceTargetAuthorization(idParsed.data);
    if (auth.establishmentId !== establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });
    const body = await parseJsonBody(request);
    const parsed = updateCatalogServiceSchema.safeParse({
      id: idParsed.data,
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

    const service = await createCatalogServiceCommandService().update({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      preServiceInstructions: parsed.data.preServiceInstructions || null,
      postServiceRecommendations: parsed.data.postServiceRecommendations || null,
    });

    return NextResponse.json(createCatalogServiceReadModel(service));
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const { serviceId } = await params;
    const idParsed = uuidSchema.safeParse(serviceId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }
    const establishmentId = new URL(_request.url).searchParams.get("establishmentId");
    if (!establishmentId) return validationErrorResponse("establishmentId is required");
    const auth = await requireCatalogServiceTargetAuthorization(idParsed.data);
    if (auth.establishmentId !== establishmentId) return NextResponse.json({ message: "Operation not permitted" }, { status: 403 });

    await createCatalogServiceCommandService().delete({ id: idParsed.data });
    return new Response(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
