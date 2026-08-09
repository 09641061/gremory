import { NextResponse } from "next/server";
import { z } from "zod";

import { createEstablishmentPhotoAdapter } from "@/contexts/business/infrastructure/adapters/establishment-photo.adapter";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";

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

    const token = await requireBusinessAccessToken();
    await createEstablishmentPhotoAdapter().delete(idParsed.data, token);

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
