import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";

import { createEstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createEstablishmentPhotoAdapter } from "@/contexts/business/infrastructure/adapters/establishment-photo.adapter";
import { requireEstablishmentCapability } from "@/contexts/business/interfaces/authorization/business-authorization";

const uuidSchema = z.string().uuid();

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

    await requireEstablishmentCapability(idParsed.data, "canUpdate");
    await createEstablishmentPhotoAdapter().remove(createEstablishmentId(idParsed.data));

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
