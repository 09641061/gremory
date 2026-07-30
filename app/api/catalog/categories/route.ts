import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceCategoryCommandService } from "@/contexts/catalog/application/internal/commandservices/service-category-command.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/queryservices/service-category-query.service";
import { createServiceCategorySchema } from "@/contexts/catalog/interfaces/rest/schemas/service-category.schemas";

const listQuerySchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

function toCategoryResource(category: { props: { id: { value: string }; establishmentId: string; name: string } }) {
  return {
    id: category.props.id.value,
    establishmentId: category.props.establishmentId,
    name: category.props.name,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      establishmentId: url.searchParams.get("establishmentId") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const page = await createServiceCategoryQueryService().list(
      parsed.data.establishmentId,
      parsed.data.page,
      parsed.data.size,
    );

    return NextResponse.json({
      ...page,
      content: page.content.map(toCategoryResource),
    });
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

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = createServiceCategorySchema.safeParse({
      establishmentId: (body as { establishmentId?: unknown })?.establishmentId,
      name: (body as { name?: unknown })?.name,
    });
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const category = await createServiceCategoryCommandService().create(parsed.data);

    return NextResponse.json(toCategoryResource(category), { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
