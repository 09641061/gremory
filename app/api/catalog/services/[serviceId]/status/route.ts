import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createCatalogServiceCommandService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { requireCatalogServiceTargetAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";

const uuidSchema = z.string().uuid();
const activeSchema = z.enum(["true", "false"]).transform((value) => value === "true");

export async function PATCH(
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
    const activeParsed = activeSchema.safeParse(url.searchParams.get("active"));
    if (!activeParsed.success) {
      return validationErrorResponse(activeParsed.error.issues[0]?.message);
    }

    await createCatalogServiceCommandService().changeStatus({
      id: idParsed.data,
      active: activeParsed.data,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
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
