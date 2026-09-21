import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { createEstablishmentCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { createEstablishmentSchema } from "@/contexts/business/interfaces/rest/schemas/establishment.schemas";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = createEstablishmentSchema.safeParse({
      organizationId: (body as { organizationId?: unknown })?.organizationId,
      name: (body as { name?: unknown })?.name,
      photoUrl: (body as { photoUrl?: unknown })?.photoUrl ?? null,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    await requireBusinessAccessToken();
    const establishmentId = await composeBusinessAdapters().establishmentCommandService.create(
      createEstablishmentCommand(parsed.data),
    );

    const establishment = await composeBusinessAdapters().establishmentQueryService.getById({
      id: establishmentId.value,
    });

    if (!establishment) {
      return NextResponse.json(
        { message: "Establishment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(establishment, { status: 201 });
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
