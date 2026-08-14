import {
  toConversationReadModel,
  toConversationReadModelFromEntity,
} from "@/contexts/assistant/application/internal/transforms/assistant-conversation.transform";

describe("assistant conversation transform", () => {
  it("removes the default assistant greeting from new conversations", () => {
    const conversation = toConversationReadModel({
      id: "conversation-0",
      title: "New conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      messages: [
        {
          id: "message-0",
          role: "ASSISTANT",
          content: "Hello. I am your assistant for business, customers, catalog, and scheduling.",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
      ],
    });

    expect(conversation.messages).toEqual([]);
  });

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
          content: "Hello",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content: "Hello, how can I help you?",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
      ],
    });

    expect(conversation.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(conversation.messages[1]?.content).toContain("Hello, how can I help you?");
  });

  it("strips internal call tags from assistant messages before exposing them to the UI", () => {
    const conversation = toConversationReadModel({
      id: "conversation-1b",
      title: "Test conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      messages: [
        {
          id: "message-1",
          role: "USER",
          content: "Crea la categoría faciales",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content:
            "[CALL: createCategory(1f3253fa-f29e-4540-b391-57719f804c2d, faciales)]\n\nLa categoría \"faciales\" ya está creada.",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
      ],
    });

    expect(conversation.messages).toHaveLength(2);
    expect(conversation.messages[1]?.content).toBe('La categoría "faciales" ya está creada.');
  });

  it("drops assistant messages that only contain internal control tags", () => {
    const conversation = toConversationReadModel({
      id: "conversation-1c",
      title: "Test conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      messages: [
        {
          id: "message-1",
          role: "USER",
          content: "Crea la categoría faciales",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content: "[CALL: createCategory(1f3253fa-f29e-4540-b391-57719f804c2d, faciales)]",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
      ],
    });

    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]?.role).toBe("user");
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
          content: "Hello",
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

  it("removes the default greeting before the first real user turn", () => {
    const conversation = toConversationReadModel({
      id: "conversation-4",
      title: "Started conversation",
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:02.000Z",
      messages: [
        {
          id: "message-0",
          role: "ASSISTANT",
          content: "Hello. I am your assistant for business, customers, catalog, and scheduling.",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-1",
          role: "USER",
          content: "Hello",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content: "Hello, how can I help you?",
          createdAt: "2026-07-29T00:00:02.000Z",
        },
      ],
    });

    expect(conversation.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(conversation.messages.map((message) => message.content)).toEqual([
      "Hello",
      "Hello, how can I help you?",
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
          content: "Hello",
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

  it("preserves a pending title when converting a domain entity", () => {
    const conversation = toConversationReadModelFromEntity({
      id: { value: "conversation-4" },
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
      getTitle: () => null,
      getMessages: () => [],
    } as never);

    expect(conversation.title).toBeNull();
  });
});
