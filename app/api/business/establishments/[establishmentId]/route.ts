import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import {
  deleteEstablishmentCommand,
  updateEstablishmentCommand,
} from "@/contexts/business/domain/model/commands/business.commands";
import { createEstablishmentCommandService } from "@/contexts/business/application/internal/commandservices/establishment-command.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { requireEstablishmentCapability } from "@/contexts/business/interfaces/authorization/business-authorization";
import { updateEstablishmentSchema } from "@/contexts/business/interfaces/rest/schemas/establishment.schemas";

const uuidSchema = z.string().uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ establishmentId: string }> },
) {
  try {
    const { establishmentId } = await params;
    const idParsed = uuidSchema.safeParse(establishmentId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    await requireEstablishmentCapability(idParsed.data, "canRead");
    const establishment = await createEstablishmentQueryService().getById({
      id: idParsed.data,
    });

    if (!establishment) {
      return NextResponse.json(
        { message: "Establishment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(establishment);
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
  { params }: { params: Promise<{ establishmentId: string }> },
) {
  try {
    const { establishmentId } = await params;
    const idParsed = uuidSchema.safeParse(establishmentId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const body = await parseJsonBody(request);
    const parsed = updateEstablishmentSchema.safeParse({
      id: idParsed.data,
      name: (body as { name?: unknown })?.name,
      photoUrl: (body as { photoUrl?: unknown })?.photoUrl ?? null,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    await requireEstablishmentCapability(idParsed.data, "canUpdate");
    await createEstablishmentCommandService().update(
      updateEstablishmentCommand(parsed.data),
    );

    const establishment = await createEstablishmentQueryService().getById({
      id: idParsed.data,
    });
    if (!establishment) {
      return NextResponse.json(
        { message: "Establishment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ establishmentId: string }> },
) {
  try {
    const { establishmentId } = await params;
    const idParsed = uuidSchema.safeParse(establishmentId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    await requireEstablishmentCapability(idParsed.data, "canDelete");
    await createEstablishmentCommandService().delete(
      deleteEstablishmentCommand({ id: idParsed.data }),
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
