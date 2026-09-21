import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";

const uuidSchema = z.string().uuid();
const paginationSchema = z.object({
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await params;
    const organizationParsed = uuidSchema.safeParse(organizationId);
    if (!organizationParsed.success) {
      return validationErrorResponse(organizationParsed.error.issues[0]?.message);
    }

    const url = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: organizationParsed.data,
      page: parsed.data.page,
      size: parsed.data.size,
    });

    return NextResponse.json(page);
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
