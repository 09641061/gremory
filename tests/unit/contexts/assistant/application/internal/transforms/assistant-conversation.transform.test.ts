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
          content: "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
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
    expect(conversation.messages[1]?.renderedContentHtml).toContain("class=\"mb-3");
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
          content: "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
          createdAt: "2026-07-29T00:00:00.000Z",
        },
        {
          id: "message-1",
          role: "USER",
          content: "Hola",
          createdAt: "2026-07-29T00:00:01.000Z",
        },
        {
          id: "message-2",
          role: "ASSISTANT",
          content: "Hola, ¿en qué puedo ayudarte?",
          createdAt: "2026-07-29T00:00:02.000Z",
        },
      ],
    });

    expect(conversation.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(conversation.messages.map((message) => message.content)).toEqual([
      "Hola",
      "Hola, ¿en qué puedo ayudarte?",
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
