import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { createOrganizationCommand } from "@/contexts/business/domain/model/commands/business.commands";
import { createOrganizationSchema } from "@/contexts/business/interfaces/rest/schemas/organization.schemas";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";

export async function GET() {
  try {
    const organization = await composeBusinessAdapters().organizationQueryService.getMyOrganization();
    return NextResponse.json(organization);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

// Onboarding step 1 (owner) and the member-starts-their-own-business path.
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = createOrganizationSchema.safeParse({
      name: (body as { name?: unknown })?.name,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    await requireBusinessAccessToken();
    const organizationId = await composeBusinessAdapters().organizationCommandService.create(
      createOrganizationCommand(parsed.data),
    );

    const organization = await composeBusinessAdapters().organizationQueryService.getById({
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

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}
