import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

describe("assistant chat presenter", () => {
  it("keeps the conversation structure intact", () => {
    const conversation: AssistantConversationReadModel = {
      id: "conversation-1",
      title: "Chat de prueba",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:01.000Z",
      messages: [
        {
          id: "message-1",
          role: "assistant",
          content: "# Titulo\n\n- Uno\n- Dos\n\n| Plan | Estado |\n| --- | --- |\n| Chat | Listo |\n\n`codigo`",
          createdAt: "2026-07-30T00:00:00.000Z",
        },
      ],
    };

    const viewModel = toConversationViewModel(conversation);

    expect(viewModel).toBe(conversation);
  });

  it("returns null when there is no conversation", () => {
    expect(toConversationViewModel(null)).toBeNull();
  });
});
