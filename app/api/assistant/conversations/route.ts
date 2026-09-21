import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { assistantConversationCreateSchema, assistantConversationListQuerySchema } from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { composeAssistantAdapters } from "@/contexts/assistant/interfaces/server/assistant-composition";
import { authorizeAssistantAccess } from "@/contexts/assistant/interfaces/authorization/assistant-authorization";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorization = await authorizeAssistantAccess();
    const query = assistantConversationListQuerySchema.parse({ search: searchParams.get("search") ?? undefined, page: searchParams.get("page") ?? undefined, size: searchParams.get("size") ?? undefined });
    return NextResponse.json(
      await composeAssistantAdapters(authorization.organizationId).listConversations.handle(query, authorization.token),
    );
  } catch (error) {
    const safe = safePublicError(error, "Failed to fetch conversations");
    return NextResponse.json({ message: safe.message }, { status: safe.status });
  }
}

export async function POST(request: Request) {
  try {
    const body = assistantConversationCreateSchema.parse(await request.json());
    const authorization = await authorizeAssistantAccess(body.establishmentId);
    const data = await composeAssistantAdapters(authorization.organizationId).createConversation.handle(
      { messageContent: body.messageContent, establishmentId: body.establishmentId },
      authorization.token,
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const safe = safePublicError(error, "Failed to create conversation");
    return NextResponse.json({ message: safe.message }, { status: safe.status });
  }
}
