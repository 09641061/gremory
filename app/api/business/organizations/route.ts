import { NextResponse } from "next/server";
import { createOrganizationCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { createOrganizationCommandService } from "@/contexts/business/application/internal/commandservices/organization-command.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createOrganizationSchema } from "@/contexts/business/interfaces/rest/schemas/organization.schemas";

export async function GET() {
  try {
    const organization = await createOrganizationQueryService().getMyOrganization();
    return NextResponse.json(organization);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = createOrganizationSchema.safeParse({
      name: (body as { name?: unknown })?.name,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const organizationId = await createOrganizationCommandService().create(
      createOrganizationCommand(parsed.data),
    );

    const organization = await createOrganizationQueryService().getById({
      id: organizationId.value,
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(organization, { status: 201 });
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
