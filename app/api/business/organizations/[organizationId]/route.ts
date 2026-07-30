import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrganizationCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { createOrganizationCommandService } from "@/contexts/business/application/internal/commandservices/organization-command.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { updateOrganizationSchema } from "@/contexts/business/interfaces/rest/schemas/organization.schemas";

const uuidSchema = z.string().uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await params;
    const parsed = uuidSchema.safeParse(organizationId);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const token = await requireBusinessAccessToken();
    const organization = await createOrganizationQueryService(token).getById({
      id: parsed.data,
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(organization);
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
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await params;
    const idParsed = uuidSchema.safeParse(organizationId);
    if (!idParsed.success) {
      return validationErrorResponse(idParsed.error.issues[0]?.message);
    }

    const body = await parseJsonBody(request);
    const parsed = updateOrganizationSchema.safeParse({
      id: idParsed.data,
      name: (body as { name?: unknown })?.name,
      imageUrl: (body as { imageUrl?: unknown })?.imageUrl ?? null,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const token = await requireBusinessAccessToken();
    await createOrganizationCommandService(token).update(
      updateOrganizationCommand(parsed.data),
    );

    const organization = await createOrganizationQueryService(token).getById({
      id: idParsed.data,
    });
    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
