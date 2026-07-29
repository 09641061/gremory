import {
  toConversationReadModel,
  toConversationReadModelFromEntity,
} from "@/contexts/assistant/application/internal/transforms/assistant-conversation.transform";

describe("assistant conversation transform", () => {
  it("keeps assistant messages on the left when roles are present", () => {
    const conversation = toConversationReadModel({
      id: "conversation-1",
      title: "Test conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      messages: [
        {
          id: "message-1",
          role: "USER",
          content: "Hola",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content: "Hola, ¿en qué puedo ayudarte?",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
      ],
    });

    expect(conversation.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
  });

  it("alternates roles for legacy conversations that arrive flattened", () => {
    const conversation = toConversationReadModel({
      id: "conversation-2",
      title: "Legacy conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      messages: [
        {
          id: "message-1",
          role: "USER",
          content: "Hola",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "USER",
          content: "Te ayudo con eso",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
        {
          id: "message-3",
          role: "USER",
          content: "Gracias",
          createdAt: "2026-07-29T00:00:02.000Z",
        },
      ],
    });

    expect(conversation.messages.map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "user",
    ]);
  });

  it("applies the same legacy fallback when converting a domain entity", () => {
    const conversation = toConversationReadModelFromEntity({
      id: { value: "conversation-3" },
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      getTitle: () => "Entity conversation",
      getMessages: () => [
        {
          id: "message-1",
          role: "USER",
          content: "Hola",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "USER",
          content: "Te ayudo con eso",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
        {
          id: "message-3",
          role: "USER",
          content: "Gracias",
          createdAt: "2026-07-29T00:00:02.000Z",
        },
      ],
    } as never);

    expect(conversation.messages.map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "user",
    ]);
  });
});
