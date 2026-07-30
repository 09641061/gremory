import { NextResponse } from "next/server";
import { z } from "zod";
import { createCatalogServiceCommandService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { updateCatalogServiceSchema } from "@/contexts/catalog/interfaces/rest/schemas/catalog-service.schemas";

const uuidSchema = z.string().uuid();

function toCatalogServiceResource(service: {
  props: {
    id: { value: string };
    establishmentId: string;
    name: string;
    description: string;
    price: { amount: number };
    durationMinutes: number;
    categoryId?: string | null;
    preServiceInstructions?: string | null;
    postServiceRecommendations?: string | null;
    preparationMinutes: number;
    cleanupMinutes: number;
    status: "ACTIVE" | "INACTIVE" | "DELETED";
  };
}) {
  return {
    id: service.props.id.value,
    establishmentId: service.props.establishmentId,
    name: service.props.name,
    description: service.props.description,
    price: service.props.price.amount,
    durationMinutes: service.props.durationMinutes,
    categoryId: service.props.categoryId ?? null,
    preServiceInstructions: service.props.preServiceInstructions ?? null,
    postServiceRecommendations: service.props.postServiceRecommendations ?? null,
    preparationMinutes: service.props.preparationMinutes,
    cleanupMinutes: service.props.cleanupMinutes,
    status: service.props.status,
  };
}

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

    const service = await createCatalogServiceQueryService().getById(
      idParsed.data,
      establishmentId,
    );

    return NextResponse.json(toCatalogServiceResource(service));
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

    return NextResponse.json(toCatalogServiceResource(service));
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

    await createCatalogServiceCommandService().delete({ id: idParsed.data });
    return new Response(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
