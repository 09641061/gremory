import { NextResponse } from "next/server";
import { createEstablishmentCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { createEstablishmentCommandService } from "@/contexts/business/application/internal/commandservices/establishment-command.service";
import { createEstablishmentSchema } from "@/contexts/business/interfaces/rest/schemas/establishment.schemas";

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

    const establishmentId = await createEstablishmentCommandService().create(
      createEstablishmentCommand(parsed.data),
    );

    return NextResponse.json({ id: establishmentId.value }, { status: 201 });
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
