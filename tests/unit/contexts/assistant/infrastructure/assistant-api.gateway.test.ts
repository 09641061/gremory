import { describe, expect, it, vi } from "vitest";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { assistantConversationResponseSchema } from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";

const conversation = {
  id: "conversation-1", userId: "user-1", title: null, createdAt: "2026-01-01T09:00:00Z", updatedAt: "2026-01-01T09:00:00Z",
  messages: [{ id: "message-1", sender: "AGENT", role: "AGENT", content: "Hello", createdAt: "2026-01-01T09:00:00Z" }],
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("Assistant gateway contract", () => {
  it("accepts a conversation response with a nullable title", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(conversation)));
    const result = await new AssistantApiGateway().getConversation("conversation-1", "token");
    expect(assistantConversationResponseSchema.parse(conversation)).toEqual(conversation);
    expect(result).toEqual(conversation);
  });

  it("preserves backend sender and user identity fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(conversation)));
    const result = await new AssistantApiGateway().getConversation("conversation-1", "token");
    expect(result.userId).toBe("user-1");
    expect(result.messages[0].sender).toBe("AGENT");
  });

  it("preserves RFC 7807 errors from conversation endpoints", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ type: "about:blank", title: "Not found", status: 404, detail: "Conversation not found" }, 404)));
    const error = await new AssistantApiGateway().getConversation("missing", "token").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: "Conversation not found" });
  });

  it("uses message and title fallbacks for streaming problem responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ message: "Stream unavailable" }, 503)));
    await expect(new AssistantApiGateway().sendMessageStream("conversation-1", { messageContent: "Hi" }, "token"))
      .rejects.toMatchObject({ status: 503, message: "Stream unavailable" });
  });

  it("rejects HTTP errors from the streaming endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ detail: "Forbidden" }, 403)));
    await expect(new AssistantApiGateway().sendMessageStream("conversation-1", { messageContent: "Hi" }, "token"))
      .rejects.toMatchObject({ status: 403, message: "Forbidden" });
  });

  it("keeps the streaming media contract", async () => {
    const streamResponse = new Response("data: {\"content\":\"Hi\"}\n\n", { status: 200, headers: { "Content-Type": "text/event-stream" } });
    const fetchMock = vi.fn().mockResolvedValue(streamResponse);
    vi.stubGlobal("fetch", fetchMock);
    const result = await new AssistantApiGateway().sendMessageStream("conversation-1", { messageContent: "Hi", establishmentId: null }, "token");
    expect(result.headers.get("Content-Type")).toBe("text/event-stream");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/messages/stream"), expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Accept: "text/event-stream" }) }));
  });
});
