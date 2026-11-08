import { describe, expect, it, vi } from "vitest";
import { ChatApiGateway } from "@/contexts/chat/infrastructure/gateways/chat-api.gateway";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("ChatApiGateway", () => {
  it("sends message with establishmentId and content in request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        id: "msg-1",
        conversationId: "conv-1",
        direction: "OUTBOUND_HUMAN",
        messageType: "text",
        content: "Hola mundo",
        deliveryStatus: "SENT",
        createdAt: "2026-10-28T18:00:00Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const gateway = new ChatApiGateway("tenant-1");
    const result = await gateway.sendMessage("conv-1", "est-1", "Hola mundo", "token-xyz");

    expect(result).toMatchObject({
      id: "msg-1",
      conversationId: "conv-1",
      content: "Hola mundo",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/chat/whatsapp/conversations/conv-1/messages"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          establishmentId: "est-1",
          content: "Hola mundo",
        }),
      }),
    );
  });
});
