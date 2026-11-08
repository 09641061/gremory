import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { updateOrganizationCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { updateOrganizationSchema } from "@/contexts/business/interfaces/rest/schemas/organization.schemas";
import { requireOrganizationCapability } from "@/contexts/business/interfaces/authorization/business-authorization";

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

    await requireOrganizationCapability(parsed.data, "canRead");
    const organization = await composeBusinessAdapters().organizationQueryService.getById({
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

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
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

    await requireOrganizationCapability(idParsed.data, "canUpdate");
    await composeBusinessAdapters().organizationCommandService.update(
      updateOrganizationCommand(parsed.data),
    );

    const organization = await composeBusinessAdapters().organizationQueryService.getById({
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
