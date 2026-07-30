import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

describe("assistant chat presenter", () => {
  it("renders assistant markdown content into html view models", () => {
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

    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<h1>Titulo</h1>");
    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<ul>");
    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<table>");
    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<code>codigo</code>");
  });

  it("normalizes bullet glyphs into real markdown lists", () => {
    const conversation: AssistantConversationReadModel = {
      id: "conversation-2",
      title: "Lista de prueba",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:01.000Z",
      messages: [
        {
          id: "message-1",
          role: "assistant",
          content:
            "Beneficios\n\n• Rápida y Eficiente: Primer punto.\n• Personalizado y Flexible: Segundo punto.\n• Segura y Protegida: Tercer punto.",
          createdAt: "2026-07-30T00:00:00.000Z",
        },
      ],
    };

    const viewModel = toConversationViewModel(conversation);

    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<ul>");
    expect(viewModel?.messages[0]?.renderedContentHtml).toContain("<li>");
    expect(viewModel?.messages[0]?.renderedContentHtml).not.toContain("•");
  });
});
