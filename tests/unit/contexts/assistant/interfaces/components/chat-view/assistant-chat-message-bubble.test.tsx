/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

vi.mock("@/contexts/shared/interfaces/components/kodu/kodu-avatar", () => ({
  AssistantAvatar: () => <div data-testid="assistant-avatar" />,
}));

import { AssistantChatMessageBubble } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-message-bubble";
import type { AssistantMessageViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

describe("AssistantChatMessageBubble", () => {
  it("renders assistant content as markdown", () => {
    const message: AssistantMessageViewModel = {
      id: "message-1",
      role: "assistant",
      content:
        "# Resumen\n\n> Nota importante\n\n- Punto uno\n- Punto dos\n\n---\n\n| Plan | Estado |\n| --- | --- |\n| Chat | Listo |\n\n[Docs](https://example.com)\n\n`code`",
      createdAt: "2026-07-29T00:00:00.000Z",
    };

    render(<AssistantChatMessageBubble message={message} />);

    expect(screen.getByRole("heading", { level: 1, name: "Resumen" })).toBeVisible();
    expect(screen.getByText("Nota importante")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("code")).toBeVisible();
    expect(screen.getByTestId("assistant-avatar")).toBeVisible();
  });
});
